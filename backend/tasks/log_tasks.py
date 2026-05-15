from celery import shared_task
from django.db import transaction

from ai_engine.analyzers import analyze_log
from apps.logs.models import DailyLog
from apps.scoring.models import ScoreDeduction
from apps.scoring.services import apply_deduction


def _build_log_payload(log: DailyLog) -> dict:
    tasks = []
    for task in log.task_entries.all().order_by("start_time", "id"):
        tasks.append(
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "initiated_by": task.initiated_by,
                "handed_to": task.handed_to,
                "start_time": task.start_time.strftime("%H:%M"),
                "end_time": task.end_time.strftime("%H:%M"),
            }
        )

    return {
        "worker_name": log.worker.get_full_name() or log.worker.username,
        "worker_role": log.worker.role,
        "worker_department": log.worker.department,
        "date": str(log.date),
        "sign_in_time": None,
        "sign_out_time": None,
        "tasks": tasks,
    }


@shared_task
@transaction.atomic
def ai_analyze_submitted_log(log_id: int):
    try:
        log = DailyLog.objects.select_related("worker").prefetch_related("task_entries").get(id=log_id)
    except DailyLog.DoesNotExist:
        return {"detail": "log_not_found", "log_id": log_id}

    result = analyze_log(_build_log_payload(log))

    verdict = result.get("verdict", "verified")
    score_impact = int(result.get("score_impact", 0) or 0)
    summary = result.get("summary", "")
    chain_issues = result.get("chain_issues", [])

    log.status = DailyLog.STATUS_VERIFIED if verdict == "verified" else DailyLog.STATUS_FLAGGED
    log.ai_analysis = summary
    log.ai_score_impact = score_impact
    log.save(update_fields=["status", "ai_analysis", "ai_score_impact"])

    flagged_task_ids = set()
    issue_map = {}
    for issue in chain_issues:
        task_id = str(issue.get("task_id", "")).strip()
        if task_id.isdigit():
            flagged_task_ids.add(int(task_id))
            issue_map[int(task_id)] = issue.get("reason", "Chain issue detected.")

    for task in log.task_entries.all():
        if task.id in flagged_task_ids:
            task.is_chain_complete = False
            task.ai_flag_reason = issue_map.get(task.id, "Chain issue detected.")
        else:
            task.is_chain_complete = True
            task.ai_flag_reason = ""
        task.save(update_fields=["is_chain_complete", "ai_flag_reason"])

    if score_impact < 0:
        points = min(abs(score_impact), 100)
        _score, _deduction = apply_deduction(
            worker=log.worker,
            reason=result.get("deduction_reason") or ScoreDeduction.REASON_AI_ANOMALY,
            points=points,
            detail=summary or "AI analysis deduction",
            applied_by=ScoreDeduction.APPLIED_BY_AI,
            score_date=log.date,
            flagged_at=log.submitted_at,
        )

    return {"detail": "ok", "log_id": log_id, "verdict": verdict}
