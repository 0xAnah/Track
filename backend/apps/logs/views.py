from datetime import date

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import HRWorkerAssignment
from apps.users.permissions import IsHR, IsWorker
from tasks.log_tasks import ai_analyze_submitted_log

from .models import DailyLog, TaskEntry
from .serializers import DailyLogSerializer, DailyLogSubmitSerializer, WorkerDateParamSerializer


def _parse_month_year(request):
    today = date.today()
    month = int(request.query_params.get("month", today.month))
    year = int(request.query_params.get("year", today.year))
    if month < 1 or month > 12:
        raise ValueError("month must be between 1 and 12")
    return month, year


class LogSubmitView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def post(self, request):
        serializer = DailyLogSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_date = serializer.validated_data.get("date", timezone.localdate())
        tasks_payload = serializer.validated_data["tasks"]

        log, created = DailyLog.objects.get_or_create(worker=request.user, date=target_date)
        if not created and log.status in (DailyLog.STATUS_SUBMITTED, DailyLog.STATUS_VERIFIED, DailyLog.STATUS_FLAGGED):
            return Response({"detail": "Today's log has already been submitted."}, status=status.HTTP_400_BAD_REQUEST)

        log.status = DailyLog.STATUS_SUBMITTED
        log.submitted_at = timezone.now()
        log.ai_analysis = ""
        log.ai_score_impact = 0
        log.save(update_fields=["status", "submitted_at", "ai_analysis", "ai_score_impact"])

        log.task_entries.all().delete()
        TaskEntry.objects.bulk_create(
            [
                TaskEntry(
                    daily_log=log,
                    title=item["title"],
                    description=item["description"],
                    initiated_by=item.get("initiated_by", ""),
                    handed_to=item.get("handed_to", ""),
                    start_time=item["start_time"],
                    end_time=item["end_time"],
                )
                for item in tasks_payload
            ]
        )

        ai_analyze_submitted_log.delay(log.id)
        log.refresh_from_db()
        return Response(DailyLogSerializer(log).data, status=status.HTTP_201_CREATED)


class TodayLogView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        today = timezone.localdate()
        try:
            log = DailyLog.objects.get(worker=request.user, date=today)
        except DailyLog.DoesNotExist:
            return Response({"detail": "No log submitted for today."}, status=status.HTTP_404_NOT_FOUND)
        return Response(DailyLogSerializer(log).data, status=status.HTTP_200_OK)


class MyLogHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        try:
            month, year = _parse_month_year(request)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        queryset = DailyLog.objects.filter(worker=request.user, date__year=year, date__month=month).order_by("date")
        return Response(DailyLogSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class WorkerLogHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, worker_id: int):
        if not HRWorkerAssignment.objects.filter(hr=request.user, worker_id=worker_id).exists():
            return Response({"detail": "Worker not found for this HR."}, status=status.HTTP_404_NOT_FOUND)
        try:
            month, year = _parse_month_year(request)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        queryset = DailyLog.objects.filter(worker_id=worker_id, date__year=year, date__month=month).order_by("date")
        return Response(DailyLogSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class WorkerLogByDateView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, worker_id: int, day: str):
        if not HRWorkerAssignment.objects.filter(hr=request.user, worker_id=worker_id).exists():
            return Response({"detail": "Worker not found for this HR."}, status=status.HTTP_404_NOT_FOUND)

        date_serializer = WorkerDateParamSerializer(data={"date": day})
        date_serializer.is_valid(raise_exception=True)
        target_date = date_serializer.validated_data["date"]

        try:
            log = DailyLog.objects.get(worker_id=worker_id, date=target_date)
        except DailyLog.DoesNotExist:
            return Response({"detail": "No log found for that date."}, status=status.HTTP_404_NOT_FOUND)
        return Response(DailyLogSerializer(log).data, status=status.HTTP_200_OK)
