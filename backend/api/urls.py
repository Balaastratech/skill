from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    register_view, current_user_view,
    SkillViewSet, MentorViewSet, SessionViewSet, 
    RatingViewSet, MessageViewSet,
)

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'mentors', MentorViewSet, basename='mentor')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_view, name='current_user'),
    
    # Router endpoints
    path('', include(router.urls)),
]
