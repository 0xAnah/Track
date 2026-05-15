from __future__ import annotations

from datetime import date, datetime

from django.utils import timezone

from .models import MonthlyScore, ScoreDeduction

DEDUCTION_CONFIG = {
    ScoreDeduction.REASON_UNEXCUSED_ABSENCE: 12,
    ScoreDeduction.REASON_MISSING_LOG: 8,
    ScoreDeduction.REASON_INCOMPLETE_CHAIN: 5,
    ScoreDeduction.REASON_LATE_SIGNIN_PATTERN: 5,
    ScoreDeduction.REASON_AI_ANOMALY: 10,
}

TIER_ELITE = "elite"
TIER_SOLID = "solid"
TIER_STANDARD = "standard"
TIER_FLAGGED = "flagged"


def get_or_create_score(
    worker,
    score_date: date | None = None,
    *,
    year: int | None = None,
    month: int | None = None,
) -> MonthlyScore:
    score_date = score_date or timezone.localdate()
    target_year = year if year is not None else score_date.year
    target_month = month if month is not None else score_date.month
    score, _ = MonthlyScore.objects.get_or_create(
        worker=worker,
        year=target_year,
        month=target_month,
        defaults={"current_score": 100},
    )
    return score


def get_tier_for_score(score_value: int) -> str:
    if score_value >= 90:
        return TIER_ELITE
    if score_value >= 80:
        return TIER_SOLID
    if score_value >= 70:
        return TIER_STANDARD
    return TIER_FLAGGED


def apply_deduction(
    *,
    worker,
    reason: str,
    points: int | None = None,
    detail: str = "",
    applied_by: str = ScoreDeduction.APPLIED_BY_SYSTEM,
    score_date: date | None = None,
    flagged_at: datetime | None = None,
) -> tuple[MonthlyScore, ScoreDeduction]:
    monthly_score = get_or_create_score(worker, score_date=score_date)

    configured_points = DEDUCTION_CONFIG.get(reason, 0)
    points_to_use = points if points is not None else configured_points
    points_to_use = max(1, min(int(points_to_use), 100))

    actual_deduction = min(points_to_use, monthly_score.current_score)
    monthly_score.current_score = max(0, monthly_score.current_score - actual_deduction)
    if monthly_score.current_score < 70 and not monthly_score.is_flagged:
        monthly_score.is_flagged = True
        monthly_score.flagged_at = flagged_at or timezone.now()
    monthly_score.save(update_fields=["current_score", "is_flagged", "flagged_at"])

    deduction = ScoreDeduction.objects.create(
        monthly_score=monthly_score,
        reason=reason,
        points_deducted=actual_deduction,
        detail=detail,
        applied_by=applied_by,
    )
    return monthly_score, deduction
