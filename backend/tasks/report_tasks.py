from collections import Counter
from datetime import date
from celery import shared_task

from django.db.models import Count
from apps.users.models import CustomUser, HRWorkerAssignment
from apps.scoring.models import MonthlyScore, ScoreDeduction
from apps.reports.models import MonthlyReport, FlaggedWorker
from ai_engine.analyzers import generate_monthly_summary
from apps.scoring.services import get_tier_for_score


@shared_task
def generate_monthly_report_for_all_hr(year: int, month: int):
    """
    Generates the end-of-month report for each HR person.
    """
    hr_users = CustomUser.objects.filter(role="hr", is_active=True)
    processed = 0

    for hr in hr_users:
        assignments = HRWorkerAssignment.objects.filter(hr=hr)
        worker_ids = list(assignments.values_list("worker_id", flat=True))
        
        if not worker_ids:
            continue

        workers = CustomUser.objects.filter(id__in=worker_ids, is_active=True)
        total_workers = workers.count()
        
        scores = MonthlyScore.objects.filter(worker_id__in=worker_ids, year=year, month=month)
        
        flagged_count = 0
        tier_breakdown = {"elite": 0, "solid": 0, "standard": 0, "flagged": 0}
        flagged_workers_data = []

        for score in scores:
            tier = get_tier_for_score(score.current_score)
            tier_breakdown[tier] += 1
            if tier == "flagged":
                flagged_count += 1
                # Find primary reason
                deductions = ScoreDeduction.objects.filter(monthly_score=score).values("reason").annotate(c=Count("id")).order_by("-c")
                primary_reason = deductions[0]["reason"] if deductions else "unknown"
                
                flagged_workers_data.append({
                    "worker": score.worker,
                    "final_score": score.current_score,
                    "primary_reason": primary_reason,
                })

        # Get top deduction reasons for all workers
        all_deductions = ScoreDeduction.objects.filter(monthly_score__in=scores).values_list("reason", flat=True)
        reason_counts = Counter(all_deductions)
        top_deduction_reasons = [{"reason": k, "count": v} for k, v in reason_counts.most_common(5)]

        report_data = {
            "hr_name": hr.get_full_name() or hr.username,
            "month": str(month),
            "year": year,
            "total_workers": total_workers,
            "flagged_count": flagged_count,
            "tier_breakdown": tier_breakdown,
            "top_deduction_reasons": top_deduction_reasons,
            "collusion_flags": 0,
            "ghost_risk_flags": 0
        }

        ai_summary = generate_monthly_summary(report_data)

        report, _ = MonthlyReport.objects.update_or_create(
            hr=hr,
            year=year,
            month=month,
            defaults={
                "total_workers": total_workers,
                "flagged_count": flagged_count,
                "summary": ai_summary,
            }
        )

        # Clear existing flagged workers for this report and recreate
        FlaggedWorker.objects.filter(report=report).delete()
        for fw_data in flagged_workers_data:
            FlaggedWorker.objects.create(
                report=report,
                worker=fw_data["worker"],
                final_score=fw_data["final_score"],
                primary_reason=fw_data["primary_reason"],
                physical_review_required=True,
            )
            
        processed += 1

    return {"processed": processed}
