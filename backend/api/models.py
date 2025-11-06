from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Skill(models.Model):
    """Represents a skill that can be taught/learned"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Profile(models.Model):
    """Extended user profile for mentors and learners"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    skills = models.ManyToManyField(Skill, blank=True, related_name='profiles')
    is_mentor = models.BooleanField(default=False)
    rating_avg = models.FloatField(default=0.0)
    rating_count = models.IntegerField(default=0)
    
    # Store availability as JSON: [{"day": 1, "start": "09:00", "end": "17:00"}, ...]
    # day: 0=Monday, 6=Sunday
    availability = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"
    
    def update_rating(self):
        """Recalculate average rating from all completed sessions"""
        from django.db.models import Avg, Count
        mentor_sessions = self.user.mentor_sessions.filter(
            status='completed',
            rating__isnull=False
        )
        result = mentor_sessions.aggregate(
            avg=Avg('rating__score'),
            count=Count('rating')
        )
        self.rating_avg = result['avg'] or 0.0
        self.rating_count = result['count'] or 0
        self.save()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create profile when user is created"""
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save profile when user is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


class Session(models.Model):
    """Mentorship session request/booking"""
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    DURATION_CHOICES = [
        (15, '15 minutes'),
        (30, '30 minutes'),
        (45, '45 minutes'),
        (60, '60 minutes'),
    ]
    
    requester = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='requested_sessions'
    )
    mentor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='mentor_sessions'
    )
    skill = models.ForeignKey(
        Skill, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='sessions'
    )
    
    duration_minutes = models.IntegerField(choices=DURATION_CHOICES, default=30)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    
    scheduled_time = models.DateTimeField(null=True, blank=True)
    meeting_url = models.URLField(blank=True, default='')
    # Idempotency key to prevent duplicate creations from client retries/HMR
    idempotency_key = models.CharField(max_length=64, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session: {self.requester.username} → {self.mentor.username} ({self.status})"


class Rating(models.Model):
    """Rating for a completed session"""
    session = models.OneToOneField(
        Session, 
        on_delete=models.CASCADE, 
        related_name='rating'
    )
    rater = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='ratings_given'
    )
    score = models.IntegerField(
        choices=[(i, f'{i} stars') for i in range(1, 6)]
    )
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Rating {self.score}/5 for session {self.session.id}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update mentor's average rating
        self.session.mentor.profile.update_rating()


class Message(models.Model):
    """Mock chat message for demonstration"""
    session = models.ForeignKey(
        Session, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='messages_sent'
    )
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username} in session {self.session.id}"
