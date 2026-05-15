from datetime import date

from django.utils.dateparse import parse_date
from rest_framework import serializers

from .models import DailyLog, TaskEntry


class TaskEntryInputSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    initiated_by = serializers.CharField(max_length=255, required=False, allow_blank=True)
    handed_to = serializers.CharField(max_length=255, required=False, allow_blank=True)
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()

    def validate(self, attrs):
        if attrs["start_time"] > attrs["end_time"]:
            raise serializers.ValidationError({"end_time": "end_time must be on or after start_time."})
        return attrs


class TaskEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskEntry
        fields = (
            "id",
            "title",
            "description",
            "initiated_by",
            "handed_to",
            "start_time",
            "end_time",
            "is_chain_complete",
            "ai_flag_reason",
        )


class DailyLogSerializer(serializers.ModelSerializer):
    task_entries = TaskEntrySerializer(many=True, read_only=True)

    class Meta:
        model = DailyLog
        fields = (
            "id",
            "worker",
            "date",
            "status",
            "ai_analysis",
            "ai_score_impact",
            "submitted_at",
            "task_entries",
        )


class DailyLogSubmitSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)
    tasks = TaskEntryInputSerializer(many=True)

    def validate_date(self, value):
        if value != date.today():
            raise serializers.ValidationError("Only today's log can be submitted.")
        return value


class WorkerDateParamSerializer(serializers.Serializer):
    date = serializers.CharField()

    def validate_date(self, value):
        parsed = parse_date(value)
        if parsed is None:
            raise serializers.ValidationError("Date must be in YYYY-MM-DD format.")
        return parsed
