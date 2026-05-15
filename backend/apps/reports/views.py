from datetime import date

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsHR
from tasks.report_tasks import generate_monthly_report_for_all_hr
from .models import MonthlyReport, FlaggedWorker
from .serializers import MonthlyReportSerializer, FlaggedWorkerSerializer


class MonthlyReportView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        today = date.today()
        month = int(request.query_params.get("month", today.month))
        year = int(request.query_params.get("year", today.year))

        report = MonthlyReport.objects.filter(hr=request.user, year=year, month=month).first()
        if not report:
            return Response({"detail": "Report not found for this month."}, status=status.HTTP_404_NOT_FOUND)

        return Response(MonthlyReportSerializer(report).data, status=status.HTTP_200_OK)


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def post(self, request):
        today = date.today()
        month = int(request.data.get("month", today.month))
        year = int(request.data.get("year", today.year))

        # Manually trigger report generation
        # We can call the celery task synchronously or asynchronously
        generate_monthly_report_for_all_hr.delay(year=year, month=month)

        return Response({"detail": "Report generation triggered."}, status=status.HTTP_202_ACCEPTED)


class ReviewFlaggedWorkerView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def patch(self, request, pk):
        flagged_worker = get_object_or_404(FlaggedWorker, pk=pk)

        # Check if HR owns the report
        if flagged_worker.report.hr != request.user:
            return Response({"detail": "Not authorized to review this worker."}, status=status.HTTP_403_FORBIDDEN)

        notes = request.data.get("review_notes", "").strip()
        if not notes:
            return Response({"detail": "Review notes are required."}, status=status.HTTP_400_BAD_REQUEST)

        flagged_worker.review_completed = True
        flagged_worker.review_notes = notes
        flagged_worker.save(update_fields=["review_completed", "review_notes"])

        return Response(FlaggedWorkerSerializer(flagged_worker).data, status=status.HTTP_200_OK)
