from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Profile, Skill, Session, Rating, Message
from .serializers import (
    UserSerializer, RegisterSerializer, ProfileSerializer,
    SkillSerializer, SessionSerializer, RatingSerializer,
    MessageSerializer, MentorListSerializer
)
from .permissions import IsMentorOrReadOnly, IsSessionParticipant


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get or update current user profile"""
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        # Update user fields
        user_fields = ['first_name', 'last_name', 'email']
        for field in user_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        
        # Update profile fields
        profile_data = {}
        profile_fields = ['bio', 'is_mentor', 'availability', 'skill_ids']
        for field in profile_fields:
            if field in request.data:
                profile_data[field] = request.data[field]
        
        if profile_data:
            profile_serializer = ProfileSerializer(
                user.profile, 
                data=profile_data, 
                partial=True
            )
            if profile_serializer.is_valid():
                profile_serializer.save()
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return updated user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve skills"""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


class MentorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List mentors with filtering by skill, search, and availability
    """
    serializer_class = MentorListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name']
    ordering_fields = ['profile__rating_avg', 'username']
    ordering = ['-profile__rating_avg']
    
    def get_queryset(self):
        queryset = User.objects.filter(profile__is_mentor=True).select_related('profile')
        
        # Filter by skill
        skill = self.request.query_params.get('skill', None)
        if skill:
            queryset = queryset.filter(profile__skills__name__icontains=skill)
        
        # Filter by skill ID
        skill_id = self.request.query_params.get('skill_id', None)
        if skill_id:
            queryset = queryset.filter(profile__skills__id=skill_id)
        
        # Filter by availability (placeholder - would need more complex logic)
        available = self.request.query_params.get('available', None)
        if available:
            queryset = queryset.exclude(profile__availability=[])
        
        return queryset.distinct()

class SessionViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for sessions
    - List: shows user's sessions (as requester or mentor)
    - Create: create new session request
    - Update: mentor can accept/complete/cancel
    - Retrieve: view session details
    """
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'scheduled_time', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Session.objects.filter(
            Q(requester=user) | Q(mentor=user)
        ).select_related('requester', 'mentor', 'skill')
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by type (upcoming/past)
        session_type = self.request.query_params.get('type', None)
        if session_type == 'upcoming':
            queryset = queryset.filter(status__in=['requested', 'accepted'])
        elif session_type == 'past':
            queryset = queryset.filter(status__in=['completed', 'cancelled'])
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsMentorOrReadOnly()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        """Mentor accepts a session request and assigns a meeting link if missing"""
        session = self.get_object()
        if session.mentor != request.user:
            return Response(
                {'error': 'Only the mentor can accept this session'},
                status=status.HTTP_403_FORBIDDEN
            )
        if session.status != 'requested':
            return Response(
                {'error': 'Session is not in requested state'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.status = 'accepted'
        session.save()
        serializer = self.get_serializer(session)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """Mark session as completed"""
        session = self.get_object()
        if session.mentor != request.user and session.requester != request.user:
            return Response(
                {'error': 'Only session participants can complete the session'},
                status=status.HTTP_403_FORBIDDEN
            )
        if session.status != 'accepted':
            return Response(
                {'error': 'Session must be accepted before completion'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.status = 'completed'
        session.save()
        serializer = self.get_serializer(session)
        return Response(serializer.data)


class RatingViewSet(viewsets.ModelViewSet):
    """
    Create and view ratings for completed sessions
    """
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Rating.objects.all().select_related('session', 'rater')
        
        # Filter by mentor (for mentor profile page)
        mentor_id = self.request.query_params.get('mentor_id', None)
        if mentor_id:
            queryset = queryset.filter(session__mentor_id=mentor_id)
        
        return queryset


class MessageViewSet(viewsets.ModelViewSet):
    """
    Mock chat messages for sessions
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Message.objects.all().select_related('sender', 'session')
        
        # Filter by session
        session_id = self.request.query_params.get('session', None)
        if session_id:
            queryset = queryset.filter(session_id=session_id)
            # Ensure user is participant
            session = Session.objects.filter(id=session_id).first()
            if session and (session.requester == self.request.user or session.mentor == self.request.user):
                return queryset
            return Message.objects.none()
        
        return queryset
