from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class MonthlyScore(models.Model):
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="monthly_scores")
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    current_score = models.PositiveSmallIntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    is_flagged = models.BooleanField(default=False)
    flagged_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["worker", "year", "month"], name="scoring_worker_year_month_unique"),
        ]
        indexes = [
            models.Index(fields=["worker", "year", "month"]),
            models.Index(fields=["is_flagged"]),
        ]

    def __str__(self) -> str:
        return f"{self.worker_id} {self.year}-{self.month}: {self.current_score}"


class ScoreDeduction(models.Model):
    REASON_UNEXCUSED_ABSENCE = "unexcused_absence"
    REASON_MISSING_LOG = "missing_log"
    REASON_INCOMPLETE_CHAIN = "incomplete_chain"
    REASON_LATE_SIGNIN_PATTERN = "late_signin_pattern"
    REASON_AI_ANOMALY = "ai_anomaly"
    REASON_CHOICES = (
        (REASON_UNEXCUSED_ABSENCE, "Unexcused absence"),
        (REASON_MISSING_LOG, "Missing log"),
        (REASON_INCOMPLETE_CHAIN, "Incomplete chain"),
        (REASON_LATE_SIGNIN_PATTERN, "Late sign-in pattern"),
        (REASON_AI_ANOMALY, "AI anomaly"),
    )

    APPLIED_BY_SYSTEM = "system"
    APPLIED_BY_AI = "ai"
    APPLIED_BY_CHOICES = (
        (APPLIED_BY_SYSTEM, "System"),
        (APPLIED_BY_AI, "AI"),
    )

    monthly_score = models.ForeignKey(MonthlyScore, on_delete=models.CASCADE, related_name="deductions")
    reason = models.CharField(max_length=32, choices=REASON_CHOICES)
    points_deducted = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    detail = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    applied_by = models.CharField(max_length=20, choices=APPLIED_BY_CHOICES, default=APPLIED_BY_SYSTEM)

    class Meta:
        indexes = [
            models.Index(fields=["monthly_score", "applied_at"]),
            models.Index(fields=["reason"]),
        ]

    def __str__(self) -> str:
        return f"{self.monthly_score_id}: -{self.points_deducted} ({self.reason})"
