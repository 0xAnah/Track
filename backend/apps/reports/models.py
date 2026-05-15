from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class MonthlyReport(models.Model):
    hr = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="monthly_reports")
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    total_workers = models.PositiveIntegerField(default=0)
    flagged_count = models.PositiveIntegerField(default=0)
    summary = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["hr", "year", "month"], name="reports_hr_year_month_unique"),
        ]
        indexes = [
            models.Index(fields=["hr", "year", "month"]),
        ]

    def __str__(self) -> str:
        return f"HR {self.hr_id} {self.year}-{self.month}"


class FlaggedWorker(models.Model):
    report = models.ForeignKey(MonthlyReport, on_delete=models.CASCADE, related_name="flagged_workers")
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="flagged_reports")
    final_score = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    primary_reason = models.TextField(blank=True)
    physical_review_required = models.BooleanField(default=True)
    review_completed = models.BooleanField(default=False)
    review_notes = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["report", "worker"], name="reports_flagged_worker_unique"),
        ]
        indexes = [
            models.Index(fields=["review_completed", "physical_review_required"]),
            models.Index(fields=["worker"]),
        ]

    def __str__(self) -> str:
        return f"{self.worker_id} ({self.final_score})"
