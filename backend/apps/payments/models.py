from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class WorkerBankAccount(models.Model):
    worker = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bank_account")
    account_number = models.CharField(max_length=20)
    bank_code = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=120)
    account_name = models.CharField(max_length=150)
    monthly_salary = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    is_verified = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["bank_code"]),
            models.Index(fields=["is_verified"]),
        ]

    def __str__(self) -> str:
        return f"{self.worker_id} - {self.bank_name}"


class SalaryDisbursement(models.Model):
    TIER_ELITE = "elite"
    TIER_SOLID = "solid"
    TIER_STANDARD = "standard"
    TIER_FLAGGED = "flagged"
    TIER_CHOICES = (
        (TIER_ELITE, "Elite"),
        (TIER_SOLID, "Solid"),
        (TIER_STANDARD, "Standard"),
        (TIER_FLAGGED, "Flagged"),
    )

    STATUS_PENDING = "pending"
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"
    STATUS_HELD = "held"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
        (STATUS_HELD, "Held"),
    )

    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="salary_disbursements")
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    base_salary = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    bonus_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    advance_deduction = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    net_amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    performance_tier = models.CharField(max_length=20, choices=TIER_CHOICES)
    integrity_score = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    squad_reference = models.CharField(max_length=128, unique=True, null=True, blank=True)
    squad_response = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    held_reason = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["worker", "year", "month"], name="payments_worker_year_month_disbursement_unique"),
        ]
        indexes = [
            models.Index(fields=["worker", "year", "month"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"{self.worker_id} {self.year}-{self.month} ({self.status})"


class SalaryAdvanceRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_DISBURSED = "disbursed"
    STATUS_REJECTED = "rejected"
    STATUS_REPAID = "repaid"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_DISBURSED, "Disbursed"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_REPAID, "Repaid"),
    )

    TIER_ELITE = SalaryDisbursement.TIER_ELITE
    TIER_SOLID = SalaryDisbursement.TIER_SOLID
    TIER_STANDARD = SalaryDisbursement.TIER_STANDARD
    TIER_FLAGGED = SalaryDisbursement.TIER_FLAGGED
    TIER_CHOICES = SalaryDisbursement.TIER_CHOICES

    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="salary_advance_requests")
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    requested_amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    approved_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    score_at_request = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    tier_at_request = models.CharField(max_length=20, choices=TIER_CHOICES)
    squad_reference = models.CharField(max_length=128, unique=True, null=True, blank=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)
    repaid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["worker", "year", "month"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"{self.worker_id} {self.requested_amount} ({self.status})"
