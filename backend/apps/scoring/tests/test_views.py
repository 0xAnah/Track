from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.scoring.models import MonthlyScore, ScoreDeduction
from apps.users.models import CustomUser, HRWorkerAssignment

User = get_user_model()


class ScoringViewsTests(APITestCase):
    def setUp(self):
        self.hr = User.objects.create_user(
            username="hr-score",
            password="Pass123!@#",
            role=CustomUser.ROLE_HR,
            employee_id="EMP-HR-SCORE",
        )
        self.worker = User.objects.create_user(
            username="worker-score",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-SCORE",
        )
        self.other_worker = User.objects.create_user(
            username="worker-score-2",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-SCORE-2",
        )
        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.worker)

        self.score = MonthlyScore.objects.create(worker=self.worker, year=2026, month=5, current_score=84)
        ScoreDeduction.objects.create(
            monthly_score=self.score,
            reason=ScoreDeduction.REASON_AI_ANOMALY,
            points_deducted=10,
            detail="AI found anomaly",
            applied_by=ScoreDeduction.APPLIED_BY_AI,
        )

    def test_worker_gets_own_score(self):
        self.client.force_authenticate(user=self.worker)
        response = self.client.get("/api/v1/scoring/mine/?month=5&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["current_score"], 84)
        self.assertEqual(response.data["tier"], "solid")

    def test_worker_mine_creates_default_score_if_missing(self):
        self.client.force_authenticate(user=self.other_worker)
        response = self.client.get("/api/v1/scoring/mine/?month=5&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["current_score"], 100)
        self.assertEqual(response.data["tier"], "elite")

    def test_hr_can_view_assigned_worker_score(self):
        self.client.force_authenticate(user=self.hr)
        response = self.client.get(f"/api/v1/scoring/worker/{self.worker.id}/?month=5&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["worker"], self.worker.id)

    def test_hr_cannot_view_unassigned_worker_score(self):
        self.client.force_authenticate(user=self.hr)
        response = self.client.get(f"/api/v1/scoring/worker/{self.other_worker.id}/?month=5&year=2026")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_hr_team_scores_returns_assigned_workers(self):
        self.client.force_authenticate(user=self.hr)
        response = self.client.get("/api/v1/scoring/team/?month=5&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["worker"], self.worker.id)

    def test_hr_can_view_worker_deductions(self):
        self.client.force_authenticate(user=self.hr)
        response = self.client.get(f"/api/v1/scoring/deductions/{self.worker.id}/?month=5&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["reason"], ScoreDeduction.REASON_AI_ANOMALY)
