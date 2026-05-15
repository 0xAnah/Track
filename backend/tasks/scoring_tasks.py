from datetime import date
from celery import shared_task
from django.utils import timezone

from apps.users.models import CustomUser
from apps.attendance.models import AttendanceRecord, LeaveRequest
from apps.logs.models import DailyLog
from apps.scoring.models import ScoreDeduction
from apps.scoring.services import apply_deduction
from ai_engine.analyzers import check_attendance_anomalies


@shared_task
def nightly_score_deduction():
    """
    Runs every night at 11pm (Mon-Fri) to evaluate daily attendance and missing logs.
    """
    today = timezone.localdate()
    # If today is weekend, we might skip or not depending on policy.
    # Assuming standard Mon-Fri work week.
    if today.weekday() >= 5:
        return {"processed": 0, "reason": "weekend"}

    workers = CustomUser.objects.filter(role="worker", is_active=True)
    processed_count = 0

    for worker in workers:
        # Check if there is an approved leave for today
        has_approved_leave = LeaveRequest.objects.filter(
            worker=worker,
            status=LeaveRequest.STATUS_APPROVED,
            start_date__lte=today,
            end_date__gte=today,
        ).exists()

        # Check attendance
        attendance = AttendanceRecord.objects.filter(worker=worker, date=today).first()
        is_absent = False
        absence_excused = has_approved_leave

        if not attendance:
            # They didn't sign in at all
            is_absent = True
            attendance = AttendanceRecord.objects.create(
                worker=worker,
                date=today,
                is_absent=True,
                absence_excused=has_approved_leave,
            )

        sign_in_time_str = attendance.sign_in_time.strftime("%H:%M") if attendance.sign_in_time else None
        sign_out_time_str = attendance.sign_out_time.strftime("%H:%M") if attendance.sign_out_time else None

        # Fetch month data for anomaly checking
        start_of_month = today.replace(day=1)
        month_records = AttendanceRecord.objects.filter(
            worker=worker,
            date__gte=start_of_month,
            date__lte=today,
        ).order_by("date")

        month_sign_in_times = []
        for rec in month_records:
            if rec.sign_in_time:
                month_sign_in_times.append(rec.sign_in_time.strftime("%H:%M"))

        # We don't have IP addresses in AttendanceRecord currently, pass empty
        month_ip_addresses = []
        today_ip = None

        anomaly_result = check_attendance_anomalies(
            worker_id=worker.id,
            sign_in_time=sign_in_time_str,
            sign_out_time=sign_out_time_str,
            date_str=str(today),
            is_absent=is_absent,
            absence_excused=absence_excused,
            month_sign_in_times=month_sign_in_times,
            month_ip_addresses=month_ip_addresses,
            today_ip=today_ip,
        )

        for deduction in anomaly_result.get("deductions", []):
            apply_deduction(
                worker=worker,
                reason=deduction["reason"],
                points=deduction["points"],
                detail=deduction["detail"],
                applied_by="system",
                score_date=today,
            )

        # Check for missing daily log
        if not is_absent and not absence_excused:
            daily_log = DailyLog.objects.filter(worker=worker, date=today).first()
            if not daily_log or daily_log.status == "draft":
                apply_deduction(
                    worker=worker,
                    reason=ScoreDeduction.REASON_MISSING_LOG,
                    detail=f"Missing submitted daily log for {today}.",
                    applied_by="system",
                    score_date=today,
                )
        processed_count += 1

    return {"processed": processed_count, "date": str(today)}
