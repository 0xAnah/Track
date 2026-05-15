from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import HRWorkerAssignment
from apps.users.permissions import IsHR, IsWorker

from .models import MonthlyScore, ScoreDeduction
from .serializers import MonthYearQuerySerializer, MonthlyScoreSerializer, ScoreDeductionSerializer, TeamScoreSerializer
from .services import get_or_create_score

User = get_user_model()


class MyScoreView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        query = MonthYearQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        month, year = query.validated_month_year()
        score = MonthlyScore.objects.filter(worker=request.user, year=year, month=month).first()
        if score is None:
            score = get_or_create_score(request.user, year=year, month=month)
        return Response(MonthlyScoreSerializer(score).data, status=status.HTTP_200_OK)


class WorkerScoreView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, worker_id: int):
        if not HRWorkerAssignment.objects.filter(hr=request.user, worker_id=worker_id).exists():
            return Response({"detail": "Worker not found for this HR."}, status=status.HTTP_404_NOT_FOUND)
        query = MonthYearQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        month, year = query.validated_month_year()
        score = MonthlyScore.objects.filter(worker_id=worker_id, year=year, month=month).first()
        if score is None:
            worker = User.objects.get(id=worker_id)
            score = get_or_create_score(worker, year=year, month=month)
        return Response(MonthlyScoreSerializer(score).data, status=status.HTTP_200_OK)


class TeamScoresView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        query = MonthYearQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        month, year = query.validated_month_year()
        worker_ids = HRWorkerAssignment.objects.filter(hr=request.user).values_list("worker_id", flat=True)
        workers = User.objects.filter(id__in=worker_ids).order_by("id")
        for worker in workers:
            get_or_create_score(worker, year=year, month=month)
        queryset = MonthlyScore.objects.filter(worker__in=workers, year=year, month=month).order_by("worker_id")
        return Response(TeamScoreSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class WorkerDeductionsView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, worker_id: int):
        if not HRWorkerAssignment.objects.filter(hr=request.user, worker_id=worker_id).exists():
            return Response({"detail": "Worker not found for this HR."}, status=status.HTTP_404_NOT_FOUND)
        query = MonthYearQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        month, year = query.validated_month_year()
        deductions = ScoreDeduction.objects.filter(
            monthly_score__worker_id=worker_id,
            monthly_score__year=year,
            monthly_score__month=month,
        ).order_by("-applied_at")
        return Response(ScoreDeductionSerializer(deductions, many=True).data, status=status.HTTP_200_OK)
