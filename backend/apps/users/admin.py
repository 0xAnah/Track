from django.contrib import admin

from .models import CustomUser, HRWorkerAssignment


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "department", "is_active")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("username", "email", "employee_id", "phone")


@admin.register(HRWorkerAssignment)
class HRWorkerAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "hr", "worker", "assigned_at")
    search_fields = ("hr__username", "worker__username", "hr__employee_id", "worker__employee_id")
