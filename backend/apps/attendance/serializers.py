from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import AttendanceRecord, LeaveRequest


class AttendanceRecordSerializer(serializers.ModelSerializer):
    is_late = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = (
            "id",
            "worker",
            "date",
            "sign_in_time",
            "sign_out_time",
            "is_absent",
            "absence_excused",
            "notes",
            "is_late",
        )
        read_only_fields = ("id", "worker", "date", "sign_in_time", "sign_out_time", "is_late")

    def get_is_late(self, obj):
        if not obj.sign_in_time:
            return None
        sign_in = timezone.localtime(obj.sign_in_time)
        late_cutoff = sign_in.replace(hour=9, minute=0, second=0, microsecond=0)
        return sign_in > late_cutoff


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = (
            "id",
            "worker",
            "start_date",
            "end_date",
            "reason",
            "status",
            "reviewed_by",
            "reviewed_at",
            "hr_notes",
        )
        read_only_fields = ("id", "worker", "status", "reviewed_by", "reviewed_at")

    def validate(self, attrs):
        if attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError({"end_date": "end_date must be on or after start_date."})
        return attrs

    def create(self, validated_data):
        return LeaveRequest.objects.create(worker=self.context["request"].user, **validated_data)


class LeaveActionSerializer(serializers.Serializer):
    hr_notes = serializers.CharField(required=False, allow_blank=True)


def iter_dates(start_date, end_date):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=1)
