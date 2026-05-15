from rest_framework.permissions import BasePermission

from .models import CustomUser


class IsHR(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == CustomUser.ROLE_HR)


class IsWorker(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == CustomUser.ROLE_WORKER)


class IsHROrReadOwn(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == CustomUser.ROLE_HR:
            return True
        return obj.pk == request.user.pk
