from django.contrib import admin

from django.contrib import admin
from .models import Profile, Skill, Session, Rating, Message


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'is_mentor', 'rating_avg', 'rating_count']
    list_filter = ['is_mentor']
    search_fields = ['user__username', 'user__email']
    filter_horizontal = ['skills']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'requester', 'mentor', 'skill', 'status', 'scheduled_time', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['requester__username', 'mentor__username']
    date_hierarchy = 'created_at'


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'rater', 'score', 'created_at']
    list_filter = ['score', 'created_at']
    search_fields = ['rater__username', 'session__id']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'sender', 'text', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['sender__username', 'text']
    date_hierarchy = 'timestamp'
