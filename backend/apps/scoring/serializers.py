from datetime import date

from rest_framework import serializers

from .models import MonthlyScore, ScoreDeduction
from .services import get_tier_for_score


class ScoreDeductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreDeduction
        fields = (
            "id",
            "reason",
            "points_deducted",
            "detail",
            "applied_at",
            "applied_by",
        )


class MonthlyScoreSerializer(serializers.ModelSerializer):
    tier = serializers.SerializerMethodField()
    deductions = ScoreDeductionSerializer(many=True, read_only=True)

    class Meta:
        model = MonthlyScore
        fields = (
            "id",
            "worker",
            "year",
            "month",
            "current_score",
            "is_flagged",
            "flagged_at",
            "tier",
            "deductions",
        )

    def get_tier(self, obj):
        return get_tier_for_score(obj.current_score)


class TeamScoreSerializer(serializers.ModelSerializer):
    tier = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyScore
        fields = ("worker", "year", "month", "current_score", "is_flagged", "tier")

    def get_tier(self, obj):
        return get_tier_for_score(obj.current_score)


class MonthYearQuerySerializer(serializers.Serializer):
    month = serializers.IntegerField(required=False, min_value=1, max_value=12)
    year = serializers.IntegerField(required=False, min_value=2000, max_value=3000)

    def validated_month_year(self):
        today = date.today()
        return (
            self.validated_data.get("month", today.month),
            self.validated_data.get("year", today.year),
        )
