from django.conf import settings
from django.db import models


class DailyLog(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_SUBMITTED = "submitted"
    STATUS_VERIFIED = "verified"
    STATUS_FLAGGED = "flagged"
    STATUS_CHOICES = (
        (STATUS_DRAFT, "Draft"),
        (STATUS_SUBMITTED, "Submitted"),
        (STATUS_VERIFIED, "Verified"),
        (STATUS_FLAGGED, "Flagged"),
    )

    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_logs")
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    ai_analysis = models.TextField(blank=True)
    ai_score_impact = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["worker", "date"], name="logs_worker_date_unique"),
        ]
        indexes = [
            models.Index(fields=["worker", "date"]),
            models.Index(fields=["worker", "status"]),
        ]

    def __str__(self) -> str:
        return f"{self.worker_id} @ {self.date} ({self.status})"


class TaskEntry(models.Model):
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name="task_entries")
    title = models.CharField(max_length=255)
    description = models.TextField()
    initiated_by = models.CharField(max_length=255)
    handed_to = models.CharField(max_length=255)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_chain_complete = models.BooleanField(default=True)
    ai_flag_reason = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(start_time__lte=models.F("end_time")),
                name="logs_task_start_before_or_equal_end",
            ),
        ]
        indexes = [
            models.Index(fields=["daily_log", "start_time"]),
        ]

    def __str__(self) -> str:
        return f"{self.daily_log_id}: {self.title}"
