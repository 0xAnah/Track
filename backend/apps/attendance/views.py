from datetime import date

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import HRWorkerAssignment
from apps.users.permissions import IsHR, IsWorker

from .models import AttendanceRecord, LeaveRequest
from .serializers import (
    AttendanceRecordSerializer,
    LeaveActionSerializer,
    LeaveRequestSerializer,
    iter_dates,
)


def _parse_month_year(request):
    today = date.today()
    month = int(request.query_params.get("month", today.month))
    year = int(request.query_params.get("year", today.year))
    if month < 1 or month > 12:
        raise ValueError("month must be between 1 and 12")
    return month, year


class SignInView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def post(self, request):
        today = timezone.localdate()
        now = timezone.now()
        record, _ = AttendanceRecord.objects.get_or_create(worker=request.user, date=today)
        if record.sign_in_time is not None:
            return Response({"detail": "You have already signed in today."}, status=status.HTTP_400_BAD_REQUEST)

        record.sign_in_time = now
        record.is_absent = False
        record.save(update_fields=["sign_in_time", "is_absent"])
        data = AttendanceRecordSerializer(record).data
        return Response(data, status=status.HTTP_200_OK)


class SignOutView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def post(self, request):
        today = timezone.localdate()
        now = timezone.now()
        try:
            record = AttendanceRecord.objects.get(worker=request.user, date=today)
        except AttendanceRecord.DoesNotExist:
            return Response({"detail": "You have not signed in today."}, status=status.HTTP_400_BAD_REQUEST)

        if record.sign_in_time is None:
            return Response({"detail": "You have not signed in today."}, status=status.HTTP_400_BAD_REQUEST)
        if record.sign_out_time is not None:
            return Response({"detail": "You have already signed out today."}, status=status.HTTP_400_BAD_REQUEST)

        record.sign_out_time = now
        record.save(update_fields=["sign_out_time"])
        return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_200_OK)


class TodayAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        today = timezone.localdate()
        try:
            record = AttendanceRecord.objects.get(worker=request.user, date=today)
        except AttendanceRecord.DoesNotExist:
            return Response({"detail": "No attendance record for today."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_200_OK)


class MyAttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        try:
            month, year = _parse_month_year(request)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        queryset = AttendanceRecord.objects.filter(worker=request.user, date__year=year, date__month=month).order_by("date")
        return Response(AttendanceRecordSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class WorkerAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, worker_id: int):
        is_assigned = HRWorkerAssignment.objects.filter(hr=request.user, worker_id=worker_id).exists()
        if not is_assigned:
            return Response({"detail": "Worker not found for this HR."}, status=status.HTTP_404_NOT_FOUND)

        try:
            month, year = _parse_month_year(request)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        queryset = AttendanceRecord.objects.filter(worker_id=worker_id, date__year=year, date__month=month).order_by("date")
        return Response(AttendanceRecordSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class LeaveRequestCreateView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def post(self, request):
        serializer = LeaveRequestSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        leave = serializer.save()
        return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_201_CREATED)


class MyLeaveRequestsView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        queryset = LeaveRequest.objects.filter(worker=request.user).order_by("-start_date", "-id")
        return Response(LeaveRequestSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class PendingLeaveRequestsView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        worker_ids = HRWorkerAssignment.objects.filter(hr=request.user).values_list("worker_id", flat=True)
        queryset = LeaveRequest.objects.filter(worker_id__in=worker_ids, status=LeaveRequest.STATUS_PENDING).order_by("start_date")
        return Response(LeaveRequestSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class LeaveApproveView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def patch(self, request, leave_id: int):
        worker_ids = HRWorkerAssignment.objects.filter(hr=request.user).values_list("worker_id", flat=True)
        try:
            leave = LeaveRequest.objects.get(id=leave_id, worker_id__in=worker_ids)
        except LeaveRequest.DoesNotExist:
            return Response({"detail": "Leave request not found for this HR."}, status=status.HTTP_404_NOT_FOUND)

        if leave.status != LeaveRequest.STATUS_PENDING:
            return Response({"detail": "Leave request is already reviewed."}, status=status.HTTP_400_BAD_REQUEST)

        action_serializer = LeaveActionSerializer(data=request.data)
        action_serializer.is_valid(raise_exception=True)

        leave.status = LeaveRequest.STATUS_APPROVED
        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()
        leave.hr_notes = action_serializer.validated_data.get("hr_notes", "")
        leave.save(update_fields=["status", "reviewed_by", "reviewed_at", "hr_notes"])

        for day in iter_dates(leave.start_date, leave.end_date):
            record, _ = AttendanceRecord.objects.get_or_create(worker=leave.worker, date=day)
            record.absence_excused = True
            record.is_absent = True
            record.save(update_fields=["absence_excused", "is_absent"])

        return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_200_OK)


class LeaveRejectView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def patch(self, request, leave_id: int):
        worker_ids = HRWorkerAssignment.objects.filter(hr=request.user).values_list("worker_id", flat=True)
        try:
            leave = LeaveRequest.objects.get(id=leave_id, worker_id__in=worker_ids)
        except LeaveRequest.DoesNotExist:
            return Response({"detail": "Leave request not found for this HR."}, status=status.HTTP_404_NOT_FOUND)

        if leave.status != LeaveRequest.STATUS_PENDING:
            return Response({"detail": "Leave request is already reviewed."}, status=status.HTTP_400_BAD_REQUEST)

        action_serializer = LeaveActionSerializer(data=request.data)
        action_serializer.is_valid(raise_exception=True)

        leave.status = LeaveRequest.STATUS_REJECTED
        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()
        leave.hr_notes = action_serializer.validated_data.get("hr_notes", "")
        leave.save(update_fields=["status", "reviewed_by", "reviewed_at", "hr_notes"])
        return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_200_OK)
