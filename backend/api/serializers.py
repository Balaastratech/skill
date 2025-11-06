from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, Skill, Session, Rating, Message


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for Skill model"""
    class Meta:
        model = Skill
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id']


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model"""
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Skill.objects.all(),
        source='skills'
    )
    
    class Meta:
        model = Profile
        fields = [
            'id', 'bio', 'skills', 'skill_ids', 'is_mentor', 
            'rating_avg', 'rating_count', 'availability'
        ]
        read_only_fields = ['id', 'rating_avg', 'rating_count']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with profile"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserSummarySerializer(serializers.ModelSerializer):
    """Lightweight user serializer for nested relations"""
    rating_avg = serializers.FloatField(source='profile.rating_avg', read_only=True)
    rating_count = serializers.IntegerField(source='profile.rating_count', read_only=True)
    is_mentor = serializers.BooleanField(source='profile.is_mentor', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'rating_avg', 'rating_count', 'is_mentor']
        read_only_fields = fields


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating model"""
    rater = UserSummarySerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
        source='session',
        write_only=True
    )
    
    class Meta:
        model = Rating
        fields = ['id', 'session', 'session_id', 'rater', 'score', 'comment', 'created_at']
        read_only_fields = ['id', 'session', 'rater', 'created_at']
    
    def validate_session_id(self, value):
        """Ensure session is completed, not already rated, and rater is the requester (learner)"""
        request = self.context.get('request')
        if value.status != 'completed':
            raise serializers.ValidationError("Can only rate completed sessions.")
        if hasattr(value, 'rating'):
            raise serializers.ValidationError("Session has already been rated.")
        if request and request.user != value.requester:
            raise serializers.ValidationError("Only the learner who requested the session can rate it.")
        return value
    
    def create(self, validated_data):
        validated_data['rater'] = self.context['request'].user
        return super().create(validated_data)


class SessionSerializer(serializers.ModelSerializer):
    """Serializer for Session model"""
    requester = UserSummarySerializer(read_only=True)
    mentor = UserSummarySerializer(read_only=True)
    mentor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='mentor',
        write_only=True
    )
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source='skill',
        write_only=True,
        required=False,
        allow_null=True
    )
    rating = RatingSerializer(read_only=True)
    
    class Meta:
        model = Session
        fields = [
            'id', 'requester', 'mentor', 'mentor_id', 'skill', 'skill_id',
            'duration_minutes', 'description', 'status', 'scheduled_time',
            'meeting_url', 'rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'requester', 'created_at', 'updated_at']
    
    def validate_mentor_id(self, value):
        """Ensure mentor is actually a mentor and not the requester themself"""
        request = self.context.get('request')
        if not value.profile.is_mentor:
            raise serializers.ValidationError("Selected user is not a mentor.")
        if request and request.user == value:
            raise serializers.ValidationError("You cannot request a session with yourself.")
        return value
    
    def validate(self, attrs):
        request = self.context.get('request')
        # ensure scheduled_time is in the future if provided (do not hard-require to avoid client issues)
        from django.utils import timezone
        from django.utils.timezone import is_naive, make_aware, get_current_timezone
        scheduled_time = attrs.get('scheduled_time')
        if scheduled_time is not None:
            try:
                if is_naive(scheduled_time):
                    scheduled_time = make_aware(scheduled_time, get_current_timezone())
                if scheduled_time <= timezone.now():
                    raise serializers.ValidationError({
                        'scheduled_time': 'Scheduled time must be in the future.'
                    })
                attrs['scheduled_time'] = scheduled_time
            except Exception:
                raise serializers.ValidationError({'scheduled_time': 'Invalid datetime value.'})
        # prevent self-request even if mentor passed differently
        mentor = attrs.get('mentor')
        if request and mentor and mentor == request.user:
            raise serializers.ValidationError({'mentor_id': 'You cannot request a session with yourself.'})
        return attrs
    
    def create(self, validated_data):
        from django.utils import timezone
        from datetime import timedelta
        from django.db import transaction
        request = self.context['request']
        requester = request.user
        mentor = validated_data.get('mentor')
        scheduled_time = validated_data.get('scheduled_time')
        description = validated_data.get('description', '')
        duration = validated_data.get('duration_minutes')

        # Prefer header key when provided
        idem = request.META.get('HTTP_X_IDEMPOTENCY_KEY')
        if idem:
            existing = Session.objects.filter(idempotency_key=idem).first()
            if existing:
                return existing

        # Time/window-based guard as fallback
        window_start = timezone.now() - timedelta(minutes=10)
        existing = Session.objects.filter(
            requester=requester,
            mentor=mentor,
            scheduled_time=scheduled_time,
            duration_minutes=duration,
            description=description,
            status='requested',
            created_at__gte=window_start,
        ).order_by('-created_at').first()
        if existing:
            return existing

        validated_data['requester'] = requester
        if idem:
            validated_data['idempotency_key'] = idem
        with transaction.atomic():
            obj = super().create(validated_data)
        return obj


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model (mock chat)"""
    sender = UserSummarySerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
        source='session',
        write_only=True
    )
    
    class Meta:
        model = Message
        fields = ['id', 'session', 'session_id', 'sender', 'text', 'timestamp']
        read_only_fields = ['id', 'session', 'sender', 'timestamp']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class MentorListSerializer(serializers.ModelSerializer):
    """Specialized serializer for mentor list view"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile']
        read_only_fields = fields
