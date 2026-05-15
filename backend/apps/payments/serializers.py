from decimal import Decimal

from rest_framework import serializers

from .models import SalaryAdvanceRequest, SalaryDisbursement, WorkerBankAccount


class WorkerBankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerBankAccount
        fields = (
            "id",
            "worker",
            "account_number",
            "bank_code",
            "bank_name",
            "account_name",
            "monthly_salary",
            "is_verified",
        )
        read_only_fields = ("id", "worker", "bank_name", "account_name", "is_verified")


class WorkerBankAccountRegisterSerializer(serializers.Serializer):
    account_number = serializers.CharField(max_length=20)
    bank_code = serializers.CharField(max_length=20)
    monthly_salary = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.01"))


class SalaryDisbursementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryDisbursement
        fields = (
            "id",
            "worker",
            "year",
            "month",
            "base_salary",
            "bonus_amount",
            "advance_deduction",
            "net_amount",
            "performance_tier",
            "integrity_score",
            "squad_reference",
            "status",
            "held_reason",
            "paid_at",
        )


class SalaryAdvanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryAdvanceRequest
        fields = (
            "id",
            "worker",
            "year",
            "month",
            "requested_amount",
            "approved_amount",
            "reason",
            "status",
            "score_at_request",
            "tier_at_request",
            "squad_reference",
            "disbursed_at",
            "repaid_at",
        )


class SalaryAdvanceCreateSerializer(serializers.Serializer):
    requested_amount = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.01"))
    reason = serializers.CharField()
