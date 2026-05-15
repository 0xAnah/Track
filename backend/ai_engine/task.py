"""
tasks/scoring_tasks.py
tasks/log_tasks.py
tasks/ghost_tasks.py
tasks/coherence_tasks.py
tasks/collusion_tasks.py
────────────────────────
All Celery tasks that run the AI engine against real Django data.

Each task:
  1. Queries Django models for the data it needs
  2. Shapes that data into the format the AI engine expects
  3. Calls the relevant ai_engine.analyzers function
  4. Writes results back to Django models

This file contains all tasks in one place for the hackathon.
In production, split into separate files per task group.
"""

from celery import shared_task
from django.utils import timezone
from django.db.models import Q
import datetime
import json

# ─────────────────────────────────────────────────────────────────────────────
# TASK 1 — NIGHTLY SCORE DEDUCTION
# Schedule: 11pm Mon–Fri
# Covers: Layer 1 (attendance), Layer 3 (deductions), Layer 4 (leave exclusion)
# ─────────────────────────────────────────────────────────────────────────────

@shared_task(bind=True, max_retries=2)
def nightly_score_deduction(self):
    """
    Runs every weeknight. For every active worker:
      - Checks attendance vs. working hours
      - Checks whether a daily log was filed
      - Checks late sign-in count for the month
      - Applies deductions via scoring service
      - Skips workers on approved leave (Layer 4)
    """
    from apps.users.models import CustomUser
    from apps.attendance.models import AttendanceRecord, LeaveRequest
    from apps.logs.models import DailyLog
    from apps.scoring.services import apply_deduction
    from ai_engine.analyzers import check_attendance_anomalies

    today = timezone.now().date()
    workers = CustomUser.objects.filter(role="worker", is_active=True)

    results = {"processed": 0, "deductions_applied": 0, "errors": 0}

    for worker in workers:
        try:
            # ── LAYER 4: Skip workers on approved leave ──
            on_approved_leave = LeaveRequest.objects.filter(
                worker=worker,
                status="approved",
                start_date__lte=today,
                end_date__gte=today,
            ).exists()

            if on_approved_leave:
                # Ensure an excused absence record exists
                AttendanceRecord.objects.get_or_create(
                    worker=worker,
                    date=today,
                    defaults={"is_absent": True, "absence_excused": True},
                )
                results["processed"] += 1
                continue

            # ── Get or create today's attendance record ──
            record, _ = AttendanceRecord.objects.get_or_create(
                worker=worker,
                date=today,
                defaults={"is_absent": True},
            )

            # ── Gather month's sign-in times for pattern analysis ──
            month_records = AttendanceRecord.objects.filter(
                worker=worker,
                date__year=today.year,
                date__month=today.month,
                date__lt=today,
                sign_in_time__isnull=False,
            ).values_list("sign_in_time", "sign_in_ip")

            month_sign_in_times = [
                r[0].strftime("%H:%M") for r in month_records if r[0]
            ]
            month_ips = [r[1] for r in month_records if r[1]]
            today_ip = record.sign_in_ip

            # ── LAYER 1: Check attendance anomalies ──
            attendance_result = check_attendance_anomalies(
                worker_id=worker.id,
                sign_in_time=record.sign_in_time.strftime("%H:%M") if record.sign_in_time else None,
                sign_out_time=record.sign_out_time.strftime("%H:%M") if record.sign_out_time else None,
                date_str=str(today),
                is_absent=record.is_absent,
                absence_excused=record.absence_excused,
                month_sign_in_times=month_sign_in_times,
                month_ip_addresses=month_ips,
                today_ip=today_ip,
            )

            # ── Check whether a log was filed ──
            log_filed = DailyLog.objects.filter(
                worker=worker,
                date=today,
                status__in=["submitted", "verified", "flagged"],
            ).exists()

            if not record.is_absent and not log_filed:
                attendance_result["deductions"].append({
                    "reason": "missing_log",
                    "points": 8,
                    "detail": f"No daily log submitted for {today}.",
                })

            # ── LAYER 3: Apply all deductions ──
            for d in attendance_result["deductions"]:
                apply_deduction(
                    worker=worker,
                    reason=d["reason"],
                    points=d["points"],
                    detail=d["detail"],
                    applied_by="system",
                )
                results["deductions_applied"] += 1

            # Store IP anomaly flag for ghost detection task
            if attendance_result.get("ip_anomaly"):
                _flag_ip_anomaly(worker.id, today, today_ip)

            results["processed"] += 1

        except Exception as exc:
            results["errors"] += 1
            # Log but don't fail entire task
            print(f"[nightly_score_deduction] Worker {worker.id} error: {exc}")

    print(f"[nightly_score_deduction] Done: {results}")
    return results


def _flag_ip_anomaly(worker_id: int, date, ip: str):
    """Store an IP anomaly signal for the weekly ghost detection task."""
    from apps.scoring.models import AIAnomalyFlag
    AIAnomalyFlag.objects.get_or_create(
        worker_id=worker_id,
        date=date,
        signal_type="ip_anomaly",
        defaults={"detail": f"New IP detected: {ip}"},
    )


# ─────────────────────────────────────────────────────────────────────────────
# TASK 2 — AI LOG ANALYSIS
# Trigger: Immediately after worker submits a daily log (not scheduled)
# Covers: Layer 2 (chain completeness), Layer 6 (NLP fabrication)
# ─────────────────────────────────────────────────────────────────────────────

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def ai_analyze_submitted_log(self, log_id: int):
    """
    Triggered when a worker submits their daily log.
    Sends the log to Claude, writes verdict back to the DailyLog,
    and applies any score deductions.
    """
    from apps.logs.models import DailyLog, TaskEntry
    from apps.scoring.services import apply_deduction
    from ai_engine.analyzers import analyze_log, compute_deductions

    try:
        log = DailyLog.objects.select_related("worker").prefetch_related(
            "task_entries"
        ).get(id=log_id)
    except DailyLog.DoesNotExist:
        return {"error": f"DailyLog {log_id} not found"}

    worker = log.worker

    # ── Shape data for AI engine ──
    tasks_data = []
    for t in log.task_entries.all():
        tasks_data.append({
            "id": str(t.id),
            "title": t.title,
            "description": t.description,
            "initiated_by": t.initiated_by,
            "handed_to": t.handed_to,
            "start_time": t.start_time.strftime("%H:%M"),
            "end_time": t.end_time.strftime("%H:%M"),
        })

    log_data = {
        "worker_name": worker.get_full_name(),
        "worker_role": getattr(worker, "job_title", worker.department),
        "worker_department": worker.department,
        "date": str(log.date),
        "sign_in_time": None,
        "sign_out_time": None,
        "tasks": tasks_data,
    }

    # Add attendance times if available
    from apps.attendance.models import AttendanceRecord
    try:
        att = AttendanceRecord.objects.get(worker=worker, date=log.date)
        if att.sign_in_time:
            log_data["sign_in_time"] = att.sign_in_time.strftime("%H:%M")
        if att.sign_out_time:
            log_data["sign_out_time"] = att.sign_out_time.strftime("%H:%M")
    except AttendanceRecord.DoesNotExist:
        pass

    # ── Call AI engine ──
    result = analyze_log(log_data)

    # ── Write verdict to DailyLog ──
    status_map = {
        "verified": "verified",
        "flagged": "flagged",
        "suspicious": "flagged",
    }
    log.status = status_map.get(result["verdict"], "flagged")
    log.ai_analysis = result.get("summary", "")
    log.ai_score_impact = result.get("score_impact", 0)
    log.ai_raw_result = json.dumps(result)
    log.save(update_fields=["status", "ai_analysis", "ai_score_impact", "ai_raw_result"])

    # ── Update individual TaskEntry records ──
    chain_issue_ids = {
        issue["task_id"] for issue in result.get("chain_issues", [])
    }
    narrative_issue_ids = {
        issue["task_id"] for issue in result.get("narrative_issues", [])
    }

    for task in log.task_entries.all():
        task_id_str = str(task.id)
        has_chain_issue = task_id_str in chain_issue_ids
        has_narrative_issue = task_id_str in narrative_issue_ids

        task.is_chain_complete = not has_chain_issue
        if has_chain_issue:
            matching = [i for i in result["chain_issues"] if i["task_id"] == task_id_str]
            task.ai_flag_reason = matching[0]["reason"] if matching else "Chain incomplete"
        elif has_narrative_issue:
            matching = [i for i in result["narrative_issues"] if i["task_id"] == task_id_str]
            task.ai_flag_reason = matching[0].get("detail", "Narrative issue detected")
        else:
            task.ai_flag_reason = ""

        task.save(update_fields=["is_chain_complete", "ai_flag_reason"])

    # ── Apply score deductions ──
    deductions = compute_deductions(result, {"deductions": []})
    for d in deductions:
        apply_deduction(
            worker=worker,
            reason=d["reason"],
            points=d["points"],
            detail=d["detail"],
            applied_by=d["applied_by"],
        )

    return {
        "log_id": log_id,
        "verdict": result["verdict"],
        "score_impact": result["score_impact"],
        "deductions_applied": len(deductions),
    }


# ─────────────────────────────────────────────────────────────────────────────
# TASK 3 — NIGHTLY CROSS-WORKER NARRATIVE COHERENCE CHECK
# Schedule: 1am daily (after all logs submitted)
# Covers: Layer 8
# ─────────────────────────────────────────────────────────────────────────────

@shared_task(bind=True, max_retries=2)
def nightly_coherence_check(self, date_str: str = None):
    """
    For every handover pair that occurred yesterday, checks whether
    Worker A's description of what they handed matches Worker B's
    description of what they received.

    Pairs that fail coherence are stored as AIAnomalyFlag records
    and factor into the weekly ghost/collusion analysis.
    """
    from apps.logs.models import DailyLog, TaskEntry
    from apps.users.models import CustomUser
    from apps.scoring.models import AIAnomalyFlag
    from ai_engine.analyzers import find_coherence_pairs, check_narrative_coherence

    if date_str:
        target_date = datetime.date.fromisoformat(date_str)
    else:
        target_date = timezone.now().date() - datetime.timedelta(days=1)

    # ── Build worker_id → task_entries map for this date ──
    logs = DailyLog.objects.filter(
        date=target_date,
        status__in=["submitted", "verified", "flagged"],
    ).select_related("worker").prefetch_related("task_entries")

    task_entries_by_worker: dict[int, list[dict]] = {}
    worker_name_to_id: dict[str, int] = {}

    for log in logs:
        worker = log.worker
        wname = worker.get_full_name()
        worker_name_to_id[wname.lower()] = worker.id

        entries = []
        for t in log.task_entries.all():
            entries.append({
                "title": t.title,
                "description": t.description,
                "initiated_by": t.initiated_by,
                "handed_to": t.handed_to,
                "worker_name": wname,
                "worker_role": getattr(worker, "job_title", worker.department),
            })
        task_entries_by_worker[worker.id] = entries

    # ── Find all matchable pairs ──
    pairs = find_coherence_pairs(
        task_entries_by_worker,
        worker_name_to_id,
        str(target_date),
    )

    flagged_pairs = 0
    for pair in pairs:
        result = check_narrative_coherence(
            date=str(target_date),
            worker_a=pair["worker_a"],
            worker_b=pair["worker_b"],
        )

        if result.get("flag_for_review") or result.get("contradiction_found"):
            # Store flag for both workers
            for wid in [pair["worker_a_id"], pair["worker_b_id"]]:
                AIAnomalyFlag.objects.get_or_create(
                    worker_id=wid,
                    date=target_date,
                    signal_type="incoherent_handover",
                    defaults={
                        "detail": (
                            f"Handover with {'Worker B' if wid == pair['worker_a_id'] else 'Worker A'}: "
                            f"{result.get('summary', '')}"
                        ),
                        "counterpart_worker_id": (
                            pair["worker_b_id"] if wid == pair["worker_a_id"]
                            else pair["worker_a_id"]
                        ),
                        "ai_confidence": result.get("confidence", 0.0),
                    },
                )
            flagged_pairs += 1

    return {
        "date": str(target_date),
        "pairs_checked": len(pairs),
        "flagged_pairs": flagged_pairs,
    }


# ─────────────────────────────────────────────────────────────────────────────
# TASK 4 — WEEKLY COLLUSION RING DETECTION
# Schedule: Every Monday 6am
# Covers: Layer 5
# ─────────────────────────────────────────────────────────────────────────────

@shared_task(bind=True, max_retries=1)
def weekly_collusion_detection(self):
    """
    Builds a handover graph for the past 30 days.
    Identifies exclusive or mutual handover pairs.
    Sends high-risk pairs to Claude for narrative review.
    Stores results as CollusionFlag records.
    """
    from apps.logs.models import TaskEntry
    from apps.users.models import CustomUser
    from apps.scoring.models import CollusionFlag
    from ai_engine.analyzers import (
        build_handover_graph,
        find_mutual_exclusivity,
        review_collusion_candidates,
    )

    thirty_days_ago = timezone.now().date() - datetime.timedelta(days=30)

    # ── Collect all task entries for the past 30 days ──
    entries_qs = TaskEntry.objects.filter(
        daily_log__date__gte=thirty_days_ago,
        daily_log__status__in=["submitted", "verified", "flagged"],
    ).select_related("daily_log__worker").values(
        "id",
        "title",
        "description",
        "initiated_by",
        "handed_to",
        "daily_log__date",
        "daily_log__worker__id",
        "daily_log__worker__first_name",
        "daily_log__worker__last_name",
        "daily_log__worker__department",
    )

    task_entries = []
    worker_name_to_id: dict[str, int] = {}

    for e in entries_qs:
        wid = e["daily_log__worker__id"]
        wname = f"{e['daily_log__worker__first_name']} {e['daily_log__worker__last_name']}".strip()
        worker_name_to_id[wname.lower()] = wid
        task_entries.append({
            "worker_id": wid,
            "worker_name": wname,
            "worker_department": e["daily_log__worker__department"],
            "initiated_by": e["initiated_by"],
            "handed_to": e["handed_to"],
            "date": str(e["daily_log__date"]),
            "title": e["title"],
            "description": e["description"],
        })

    if not task_entries:
        return {"message": "No task entries in last 30 days."}

    # ── Build graph and find exclusive pairs ──
    graph = build_handover_graph(task_entries)
    suspect_pairs = find_mutual_exclusivity(graph, worker_name_to_id)

    if not suspect_pairs:
        return {"suspect_pairs_found": 0}

    # ── For high-risk pairs, get Claude's narrative assessment ──
    ai_reviewed = 0
    for pair in suspect_pairs:
        if pair["risk_level"] != "high":
            # Medium risk: store for monitoring without AI call
            CollusionFlag.objects.update_or_create(
                worker_a_id=pair["worker_a_id"],
                worker_b_name=pair["worker_b_name"],
                defaults={
                    "risk_level": "medium",
                    "a_to_b_ratio": pair["a_to_b_ratio"],
                    "b_to_a_ratio": pair.get("b_to_a_ratio"),
                    "ai_verdict": None,
                    "recommendation": "monitor",
                },
            )
            continue

        # Build sample interactions for AI review
        # Find days where both workers have entries referencing each other
        a_name_lower = pair["worker_a_name"].lower()
        b_name_lower = pair["worker_b_name"].lower()

        sample = []
        for e in task_entries:
            if (
                e["worker_id"] == pair["worker_a_id"]
                and b_name_lower in (e.get("handed_to") or "").lower()
            ):
                # Find matching B entry on the same date
                b_entry = next(
                    (
                        x for x in task_entries
                        if x["worker_id"] == pair.get("worker_b_id")
                        and x["date"] == e["date"]
                        and a_name_lower in (x.get("initiated_by") or "").lower()
                    ),
                    None,
                )
                sample.append({
                    "date": e["date"],
                    "direction": "A→B",
                    "a_description": e["description"],
                    "b_description": b_entry["description"] if b_entry else "(no matching entry)",
                })
                if len(sample) >= 5:
                    break

        worker_a_info = {
            "name": pair["worker_a_name"],
            "role": "",
            "department": "",
        }
        worker_b_info = {
            "name": pair["worker_b_name"],
            "role": "",
            "department": "",
        }

        interaction_summary = {
            "total_days_analysed": 30,
            "a_handed_to_b_count": int(pair["a_to_b_ratio"] * graph["out_degree"].get(pair["worker_a_id"], 0)),
            "b_handed_to_a_count": int((pair.get("b_to_a_ratio") or 0) * graph["out_degree"].get(pair.get("worker_b_id", 0), 0)),
            "a_total_handovers": graph["out_degree"].get(pair["worker_a_id"], 0),
            "b_total_handovers": graph["out_degree"].get(pair.get("worker_b_id", 0), 0),
            "sample_interactions": sample,
        }

        ai_result = review_collusion_candidates(
            worker_a=worker_a_info,
            worker_b=worker_b_info,
            interaction_summary=interaction_summary,
        )

        CollusionFlag.objects.update_or_create(
            worker_a_id=pair["worker_a_id"],
            worker_b_name=pair["worker_b_name"],
            defaults={
                "risk_level": ai_result.get("collusion_likelihood", "medium"),
                "a_to_b_ratio": pair["a_to_b_ratio"],
                "b_to_a_ratio": pair.get("b_to_a_ratio"),
                "ai_verdict": ai_result.get("summary", ""),
                "recommendation": ai_result.get("recommendation", "monitor"),
                "ai_red_flags": json.dumps(ai_result.get("red_flags", [])),
                "ai_confidence": ai_result.get("confidence", 0.0),
            },
        )
        ai_reviewed += 1

    return {
        "suspect_pairs_found": len(suspect_pairs),
        "ai_reviewed": ai_reviewed,
    }


# ─────────────────────────────────────────────────────────────────────────────
# TASK 5 — WEEKLY GHOST WORKER SIGNATURE CHECK
# Schedule: Every Sunday 4am
# Covers: Layer 7
# ─────────────────────────────────────────────────────────────────────────────

@shared_task(bind=True, max_retries=1)
def weekly_ghost_signature_check(self):
    """
    For every active worker, computes 30-day behavioural statistics
    and checks them against ghost-worker signature thresholds.
    Stores results in GhostRiskFlag model.
    """
    from apps.users.models import CustomUser
    from apps.attendance.models import AttendanceRecord
    from apps.logs.models import TaskEntry
    from apps.scoring.models import GhostRiskFlag
    from ai_engine.analyzers import compute_behavioural_statistics, check_ghost_signatures

    thirty_days_ago = timezone.now().date() - datetime.timedelta(days=30)
    workers = CustomUser.objects.filter(role="worker", is_active=True)

    flagged = 0
    for worker in workers:
        try:
            # Attendance data
            att_records = AttendanceRecord.objects.filter(
                worker=worker,
                date__gte=thirty_days_ago,
            ).order_by("date")

            sign_in_times = [
                r.sign_in_time.strftime("%H:%M")
                for r in att_records if r.sign_in_time
            ]
            sign_out_times = [
                r.sign_out_time.strftime("%H:%M")
                for r in att_records if r.sign_out_time
            ]
            ip_addresses = [
                r.sign_in_ip for r in att_records if r.sign_in_ip
            ]

            # Task entry data
            task_entries_qs = TaskEntry.objects.filter(
                daily_log__worker=worker,
                daily_log__date__gte=thirty_days_ago,
            ).values(
                "title", "description", "initiated_by", "handed_to",
                "daily_log__date", "start_time",
            )

            task_entries = [
                {
                    "title": e["title"],
                    "description": e["description"],
                    "initiated_by": e["initiated_by"],
                    "handed_to": e["handed_to"],
                    "date": str(e["daily_log__date"]),
                    "start_time": e["start_time"].strftime("%H:%M") if e["start_time"] else "",
                }
                for e in task_entries_qs
            ]

            # Need at least 10 days of data to make meaningful assessment
            if len(sign_in_times) < 10:
                continue

            stats = compute_behavioural_statistics(
                worker_name=worker.get_full_name(),
                worker_role=getattr(worker, "job_title", worker.department),
                sign_in_times=sign_in_times,
                sign_out_times=sign_out_times,
                ip_addresses=ip_addresses,
                task_entries=task_entries,
            )

            result = check_ghost_signatures(stats)

            risk_level = result.get("ghost_risk_level", "none")
            if risk_level in ("medium", "high"):
                GhostRiskFlag.objects.update_or_create(
                    worker=worker,
                    defaults={
                        "risk_level": risk_level,
                        "ai_confidence": result.get("confidence", 0.0),
                        "signals_detected": json.dumps(result.get("signals_detected", [])),
                        "recommendation": result.get("recommendation", "monitor"),
                        "ai_summary": result.get("summary", ""),
                        "checked_at": timezone.now(),
                    },
                )
                flagged += 1
            else:
                # Clear any previous flag if worker's behaviour improved
                GhostRiskFlag.objects.filter(worker=worker).delete()

        except Exception as exc:
            print(f"[weekly_ghost_check] Worker {worker.id} error: {exc}")

    return {"workers_checked": workers.count(), "flagged": flagged}


# ─────────────────────────────────────────────────────────────────────────────
# CELERY BEAT SCHEDULE (paste into config/settings/base.py)
# ─────────────────────────────────────────────────────────────────────────────
"""
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {

    # Layer 1 + 3 + 4: Attendance, deductions, leave exclusion
    "nightly-scoring": {
        "task": "tasks.scoring_tasks.nightly_score_deduction",
        "schedule": crontab(hour=23, minute=0, day_of_week="1-5"),
    },

    # Layer 8: Cross-worker narrative coherence
    "nightly-coherence": {
        "task": "tasks.scoring_tasks.nightly_coherence_check",
        "schedule": crontab(hour=1, minute=0),   # 1am daily
    },

    # Layer 5: Collusion ring detection
    "weekly-collusion": {
        "task": "tasks.scoring_tasks.weekly_collusion_detection",
        "schedule": crontab(hour=6, minute=0, day_of_week="1"),  # Monday 6am
    },

    # Layer 7: Ghost worker signature detection
    "weekly-ghost-check": {
        "task": "tasks.scoring_tasks.weekly_ghost_signature_check",
        "schedule": crontab(hour=4, minute=0, day_of_week="0"),  # Sunday 4am
    },

    # End-of-month: Report + salary disbursement
    "monthly-report": {
        "task": "tasks.report_tasks.generate_monthly_report_for_all_hr",
        "schedule": crontab(hour=6, minute=0, day_of_month="28-31"),
    },
    "salary-disbursement": {
        "task": "tasks.payment_tasks.end_of_month_salary_disbursement",
        "schedule": crontab(hour=8, minute=0, day_of_month="28-31"),
    },
}
"""
