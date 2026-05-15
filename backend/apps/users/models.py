from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.crypto import get_random_string


def _generate_company_signup_key() -> str:
    return f"HRK-{get_random_string(12).upper()}"


class CustomUser(AbstractUser):
    ROLE_HR = "hr"
    ROLE_WORKER = "worker"
    ROLE_CHOICES = (
        (ROLE_HR, "HR"),
        (ROLE_WORKER, "Worker"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_WORKER)
    department = models.CharField(max_length=150, blank=True)
    employee_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    company_signup_key = models.CharField(max_length=32, unique=True, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["role"]),
            models.Index(fields=["company_name"]),
        ]

    def save(self, *args, **kwargs):
        if self.role == self.ROLE_HR and not self.company_signup_key:
            key = _generate_company_signup_key()
            while CustomUser.objects.filter(company_signup_key=key).exists():
                key = _generate_company_signup_key()
            self.company_signup_key = key
        if self.role != self.ROLE_HR:
            self.company_signup_key = None
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"


class HRWorkerAssignment(models.Model):
    hr = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="worker_assignments")
    worker = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assigned_hr",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=~models.Q(hr=models.F("worker")),
                name="users_hr_worker_assignment_no_self_assignment",
            ),
        ]
        indexes = [
            models.Index(fields=["hr", "assigned_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.worker_id} -> {self.hr_id}"


class WorkerInviteCredential(models.Model):
    hr = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="worker_invite_credentials")
    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generated_credentials",
    )
    email = models.EmailField()
    username = models.CharField(max_length=150)
    temporary_password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["hr", "-created_at"]),
            models.Index(fields=["worker", "-created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.email} invited by HR {self.hr_id}"
