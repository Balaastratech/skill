from rest_framework import permissions


class IsMentorOrReadOnly(permissions.BasePermission):
    """
    Custom permission: mentor can accept sessions, others can only read
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only the mentor can update the session (accept/complete/cancel)
        return obj.mentor == request.user


class IsSessionParticipant(permissions.BasePermission):
    """
    Custom permission: only session participants can view/manage the session
    """
    def has_object_permission(self, request, view, obj):
        return obj.requester == request.user or obj.mentor == request.user


class IsRaterOrReadOnly(permissions.BasePermission):
    """
    Custom permission: only the rater can create/edit ratings
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.rater == request.user
