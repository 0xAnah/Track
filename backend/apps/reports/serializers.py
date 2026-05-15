from rest_framework import serializers

from apps.users.serializers import UserSerializer
from .models import MonthlyReport, FlaggedWorker


class FlaggedWorkerSerializer(serializers.ModelSerializer):
    worker_details = UserSerializer(source="worker", read_only=True)

    class Meta:
        model = FlaggedWorker
        fields = [
            "id",
            "worker",
            "worker_details",
            "final_score",
            "primary_reason",
            "physical_review_required",
            "review_completed",
            "review_notes",
        ]
        read_only_fields = ["worker", "worker_details", "final_score", "primary_reason", "physical_review_required"]


class MonthlyReportSerializer(serializers.ModelSerializer):
    flagged_workers = FlaggedWorkerSerializer(many=True, read_only=True)

    class Meta:
        model = MonthlyReport
        fields = [
            "id",
            "hr",
            "year",
            "month",
            "total_workers",
            "flagged_count",
            "summary",
            "flagged_workers",
        ]
        read_only_fields = ["hr", "year", "month", "total_workers", "flagged_count", "summary", "flagged_workers"]
