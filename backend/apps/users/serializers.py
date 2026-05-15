from datetime import date

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from apps.scoring.models import MonthlyScore

from .models import CustomUser, HRWorkerAssignment, WorkerInviteCredential

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class HRSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "department",
            "employee_id",
            "phone",
            "company_name",
        )

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data, role=CustomUser.ROLE_HR)
        user.set_password(password)
        user.save()
        return user


class WorkerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    hr_signup_key = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "department",
            "employee_id",
            "phone",
            "hr_signup_key",
        )

    def validate_hr_signup_key(self, value):
        try:
            hr = User.objects.get(company_signup_key=value, role=CustomUser.ROLE_HR)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Invalid HR signup key.") from exc
        self.context["hr_user"] = hr
        return value

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("hr_signup_key")
        hr = self.context["hr_user"]
        password = validated_data.pop("password")
        user = User(**validated_data, role=CustomUser.ROLE_WORKER, company_name=hr.company_name)
        user.set_password(password)
        user.save()
        HRWorkerAssignment.objects.create(hr=hr, worker=user)
        return user


class WorkerInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "department",
            "employee_id",
        )


class BulkWorkerInviteSerializer(serializers.Serializer):
    workers = WorkerInviteSerializer(many=True)


class UserSerializer(serializers.ModelSerializer):
    current_score = serializers.SerializerMethodField()
    current_month = serializers.SerializerMethodField()
    current_year = serializers.SerializerMethodField()
    is_flagged = serializers.SerializerMethodField()
    worker_signup_key = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "department",
            "employee_id",
            "phone",
            "company_name",
            "worker_signup_key",
            "is_active",
            "current_score",
            "is_flagged",
            "current_month",
            "current_year",
        )

    def _get_current_month_score(self, obj):
        today = date.today()
        return (
            MonthlyScore.objects.filter(worker=obj, year=today.year, month=today.month)
            .only("current_score", "is_flagged")
            .first()
        )

    def get_current_score(self, obj):
        score = self._get_current_month_score(obj)
        return score.current_score if score else None

    def get_is_flagged(self, obj):
        score = self._get_current_month_score(obj)
        return score.is_flagged if score else None

    def get_current_month(self, _obj):
        return date.today().month

    def get_current_year(self, _obj):
        return date.today().year

    def get_worker_signup_key(self, obj):
        if obj.role == CustomUser.ROLE_HR:
            return obj.company_signup_key
        return None


class WorkerAssignmentSerializer(serializers.Serializer):
    worker_id = serializers.IntegerField(min_value=1)

    def validate_worker_id(self, value):
        request = self.context["request"]
        if request.user.pk == value:
            raise serializers.ValidationError("You cannot assign yourself.")

        try:
            worker = User.objects.get(pk=value)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Worker not found.") from exc

        if worker.role != CustomUser.ROLE_WORKER:
            raise serializers.ValidationError("Selected user is not a worker.")
        return value

    def save(self, **kwargs):
        hr = self.context["request"].user
        worker = User.objects.get(pk=self.validated_data["worker_id"])
        assignment, _ = HRWorkerAssignment.objects.update_or_create(
            worker=worker,
            defaults={"hr": hr},
        )
        return assignment


class WorkerInviteCredentialSerializer(serializers.ModelSerializer):
    worker_id = serializers.IntegerField(source="worker.id", read_only=True)
    worker_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkerInviteCredential
        fields = (
            "id",
            "worker_id",
            "worker_name",
            "email",
            "username",
            "temporary_password",
            "created_at",
        )

    def get_worker_name(self, obj):
        return f"{obj.worker.first_name} {obj.worker.last_name}".strip()
