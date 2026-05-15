from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone

from apps.scoring.models import MonthlyScore
from apps.scoring.services import TIER_ELITE, TIER_FLAGGED, TIER_SOLID, TIER_STANDARD, get_tier_for_score

from .models import SalaryAdvanceRequest, SalaryDisbursement, WorkerBankAccount
from .squad_client import SquadClient

TIER_CONFIG = {
    TIER_ELITE: {"bonus_percent": Decimal("2.0"), "advance_limit_percent": Decimal("50")},
    TIER_SOLID: {"bonus_percent": Decimal("1.0"), "advance_limit_percent": Decimal("30")},
    TIER_STANDARD: {"bonus_percent": Decimal("0.0"), "advance_limit_percent": Decimal("0")},
    TIER_FLAGGED: {"bonus_percent": Decimal("0.0"), "advance_limit_percent": Decimal("0")},
}


def naira_to_kobo(amount: Decimal) -> int:
    return int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


import os

def generate_reference(prefix: str, worker_id: int, year: int, month: int, suffix: str = "") -> str:
    merchant_id = os.getenv("SQUAD_MERCHANT_ID", "TESTMERCHANT")
    core = f"{merchant_id}_{prefix}-{worker_id}-{year}{month:02d}"
    return f"{core}-{suffix}" if suffix else core


def _current_month_score(worker, year: int, month: int) -> MonthlyScore:
    score = MonthlyScore.objects.filter(worker=worker, year=year, month=month).first()
    if score is None:
        score = MonthlyScore.objects.create(worker=worker, year=year, month=month, current_score=100)
    return score


def _sum_unrepaid_advances(worker, year: int, month: int) -> Decimal:
    advances = SalaryAdvanceRequest.objects.filter(
        worker=worker,
        year=year,
        month=month,
        status__in=[SalaryAdvanceRequest.STATUS_APPROVED, SalaryAdvanceRequest.STATUS_DISBURSED],
        repaid_at__isnull=True,
    )
    total = Decimal("0.00")
    for item in advances:
        if item.approved_amount:
            total += item.approved_amount
    return total


@transaction.atomic
def disburse_salary(*, worker, year: int, month: int, release_held: bool = False) -> SalaryDisbursement:
    bank_account = WorkerBankAccount.objects.filter(worker=worker, is_verified=True).first()
    if bank_account is None:
        raise ValueError("Verified bank account is required for disbursement.")

    score = _current_month_score(worker, year, month)
    tier = get_tier_for_score(score.current_score)
    bonus_percent = TIER_CONFIG[tier]["bonus_percent"]
    bonus_amount = (bank_account.monthly_salary * bonus_percent / Decimal("100")).quantize(Decimal("0.01"))
    advance_deduction = _sum_unrepaid_advances(worker, year, month)
    net_amount = (bank_account.monthly_salary + bonus_amount - advance_deduction).quantize(Decimal("0.01"))
    net_amount = max(net_amount, Decimal("0.00"))

    disbursement, _ = SalaryDisbursement.objects.get_or_create(
        worker=worker,
        year=year,
        month=month,
        defaults={
            "base_salary": bank_account.monthly_salary,
            "bonus_amount": bonus_amount,
            "advance_deduction": advance_deduction,
            "net_amount": net_amount,
            "performance_tier": tier,
            "integrity_score": score.current_score,
            "status": SalaryDisbursement.STATUS_PENDING,
        },
    )
    disbursement.base_salary = bank_account.monthly_salary
    disbursement.bonus_amount = bonus_amount
    disbursement.advance_deduction = advance_deduction
    disbursement.net_amount = net_amount
    disbursement.performance_tier = tier
    disbursement.integrity_score = score.current_score

    if score.current_score < 70 and not release_held:
        disbursement.status = SalaryDisbursement.STATUS_HELD
        disbursement.held_reason = "Integrity score below 70."
        disbursement.save()
        return disbursement

    reference = generate_reference("VF-SAL", worker.id, year, month, "REL" if release_held else "")
    client = SquadClient()
    transfer = client.initiate_transfer(
        amount_kobo=naira_to_kobo(net_amount),
        bank_code=bank_account.bank_code,
        account_number=bank_account.account_number,
        account_name=bank_account.account_name,
        transaction_reference=reference,
        narration=f"VerifyForce salary payout {year}-{month:02d}",
    )
    disbursement.squad_reference = transfer.get("transaction_reference", reference)
    disbursement.squad_response = transfer
    disbursement.status = SalaryDisbursement.STATUS_PENDING
    disbursement.held_reason = ""
    disbursement.save()
    return disbursement


@transaction.atomic
def request_salary_advance(*, worker, requested_amount: Decimal, reason: str, year: int, month: int) -> SalaryAdvanceRequest:
    bank_account = WorkerBankAccount.objects.filter(worker=worker, is_verified=True).first()
    if bank_account is None:
        raise ValueError("Verified bank account is required for salary advance.")

    score = _current_month_score(worker, year, month)
    tier = get_tier_for_score(score.current_score)
    limit_percent = TIER_CONFIG[tier]["advance_limit_percent"]
    if limit_percent <= 0:
        raise ValueError("Current performance tier is not eligible for salary advance.")

    max_advance = (bank_account.monthly_salary * limit_percent / Decimal("100")).quantize(Decimal("0.01"))
    if requested_amount <= Decimal("0.00"):
        raise ValueError("Requested amount must be greater than zero.")
    if requested_amount > max_advance:
        raise ValueError(f"Requested amount exceeds tier limit ({max_advance}).")

    reference = generate_reference("VF-ADV", worker.id, year, month)

    advance = SalaryAdvanceRequest.objects.create(
        worker=worker,
        year=year,
        month=month,
        requested_amount=requested_amount,
        approved_amount=requested_amount,
        reason=reason,
        status=SalaryAdvanceRequest.STATUS_PENDING,
        score_at_request=score.current_score,
        tier_at_request=tier,
        squad_reference=reference,
    )
    
    from tasks.payment_tasks import process_salary_advance
    process_salary_advance.delay(advance.id)
    
    return advance


def worker_payment_snapshot(worker, year: int, month: int) -> dict:
    score = _current_month_score(worker, year, month)
    tier = get_tier_for_score(score.current_score)
    bank_account = WorkerBankAccount.objects.filter(worker=worker).first()
    disbursement = SalaryDisbursement.objects.filter(worker=worker, year=year, month=month).first()
    outstanding_advance = _sum_unrepaid_advances(worker, year, month)
    max_advance = Decimal("0.00")
    if bank_account:
        max_advance = (
            bank_account.monthly_salary * TIER_CONFIG[tier]["advance_limit_percent"] / Decimal("100")
        ).quantize(Decimal("0.01"))
    return {
        "year": year,
        "month": month,
        "integrity_score": score.current_score,
        "tier": tier,
        "advance_eligible": TIER_CONFIG[tier]["advance_limit_percent"] > 0 and bank_account and bank_account.is_verified,
        "advance_limit": max_advance,
        "outstanding_advance": outstanding_advance,
        "disbursement": disbursement,
        "bank_account_verified": bool(bank_account and bank_account.is_verified),
    }
