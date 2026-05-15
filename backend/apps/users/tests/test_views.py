from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.attendance.models import AttendanceRecord
from apps.logs.models import DailyLog
from apps.scoring.models import MonthlyScore
from apps.users.models import CustomUser, HRWorkerAssignment, WorkerInviteCredential

User = get_user_model()


class UsersAuthAndViewsTests(APITestCase):
    def setUp(self):
        self.hr = User.objects.create_user(
            username="hr1",
            password="Pass123!@#",
            role=CustomUser.ROLE_HR,
            employee_id="EMP-HR-1",
        )
        self.worker = User.objects.create_user(
            username="worker1",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-1",
        )
        self.other_worker = User.objects.create_user(
            username="worker2",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-2",
        )

    def test_login_returns_access_refresh_and_user(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "hr1", "password": "Pass123!@#"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["role"], CustomUser.ROLE_HR)

    def test_login_allows_email_case_insensitive(self):
        self.hr.email = "hr1@example.com"
        self.hr.save(update_fields=["email"])
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "HR1@EXAMPLE.COM", "password": "Pass123!@#"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_login_strips_identifier_whitespace(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "  hr1  ", "password": "Pass123!@#"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_hr_signup_creates_hr_and_returns_signup_key(self):
        response = self.client.post(
            "/api/v1/auth/signup/hr/",
            {
                "username": "newhr",
                "password": "Pass123!@#",
                "email": "newhr@example.com",
                "first_name": "New",
                "last_name": "HR",
                "department": "Compliance",
                "employee_id": "EMP-HR-NEW",
                "phone": "08000000001",
                "company_name": "Acme Corp",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["role"], CustomUser.ROLE_HR)
        self.assertTrue(response.data["user"]["worker_signup_key"])
        self.assertEqual(response.data["user"]["company_name"], "Acme Corp")

    def test_worker_signup_with_hr_key_assigns_worker_under_hr(self):
        hr_signup = self.client.post(
            "/api/v1/auth/signup/hr/",
            {
                "username": "hr-with-key",
                "password": "Pass123!@#",
                "email": "hr-with-key@example.com",
                "first_name": "Key",
                "last_name": "HR",
                "department": "Ops",
                "employee_id": "EMP-HR-KEY",
                "phone": "08000000002",
                "company_name": "Keyed Corp",
            },
            format="json",
        )
        key = hr_signup.data["user"]["worker_signup_key"]

        worker_signup = self.client.post(
            "/api/v1/auth/signup/worker/",
            {
                "username": "worker-with-key",
                "password": "Pass123!@#",
                "email": "worker-with-key@example.com",
                "first_name": "Worker",
                "last_name": "One",
                "department": "Ops",
                "employee_id": "EMP-W-KEY",
                "phone": "08000000003",
                "hr_signup_key": key,
            },
            format="json",
        )
        self.assertEqual(worker_signup.status_code, status.HTTP_201_CREATED)
        worker_id = worker_signup.data["user"]["id"]
        hr = User.objects.get(username="hr-with-key")
        worker = User.objects.get(id=worker_id)
        self.assertEqual(worker.company_name, hr.company_name)
        self.assertTrue(HRWorkerAssignment.objects.filter(hr=hr, worker=worker).exists())

    def test_worker_signup_rejects_invalid_hr_key(self):
        response = self.client.post(
            "/api/v1/auth/signup/worker/",
            {
                "username": "worker-invalid-key",
                "password": "Pass123!@#",
                "email": "worker-invalid-key@example.com",
                "first_name": "Worker",
                "last_name": "Two",
                "department": "Ops",
                "employee_id": "EMP-W-BADKEY",
                "phone": "08000000004",
                "hr_signup_key": "HRK-INVALID",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_authentication(self):
        response = self.client.get("/api/v1/users/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_profile_for_authenticated_user(self):
        self.client.force_authenticate(user=self.hr)
        response = self.client.get("/api/v1/users/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.hr.id)
        self.assertEqual(response.data["username"], "hr1")

    def test_hr_can_assign_worker(self):
        self.client.force_authenticate(user=self.hr)
        response = self.client.post("/api/v1/users/workers/assign/", {"worker_id": self.worker.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(HRWorkerAssignment.objects.filter(hr=self.hr, worker=self.worker).exists())

    def test_non_hr_cannot_assign_worker(self):
        self.client.force_authenticate(user=self.worker)
        response = self.client.post("/api/v1/users/workers/assign/", {"worker_id": self.other_worker.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_hr_worker_list_returns_only_assigned_workers(self):
        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.worker)
        self.client.force_authenticate(user=self.hr)
        response = self.client.get("/api/v1/users/workers/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.worker.id)

    @patch("apps.users.views.send_mail")
    def test_invite_worker_creates_credential_record(self, _mock_send_mail):
        self.client.force_authenticate(user=self.hr)
        response = self.client.post(
            "/api/v1/users/workers/invite/",
            {
                "email": "new.worker@example.com",
                "first_name": "New",
                "last_name": "Worker",
                "department": "Ops",
                "employee_id": "EMP-W-NEW",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            WorkerInviteCredential.objects.filter(
                hr=self.hr,
                email="new.worker@example.com",
            ).exists()
        )

    @patch("apps.users.views.send_mail")
    def test_hr_can_fetch_generated_worker_credentials(self, _mock_send_mail):
        self.client.force_authenticate(user=self.hr)
        self.client.post(
            "/api/v1/users/workers/invite/",
            {
                "email": "credentials.worker@example.com",
                "first_name": "Cred",
                "last_name": "Worker",
                "department": "Ops",
                "employee_id": "EMP-W-CRED",
            },
            format="json",
        )
        response = self.client.get("/api/v1/users/workers/invite-credentials/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], "credentials.worker@example.com")
        self.assertTrue(response.data[0]["temporary_password"])

    @patch("apps.users.views.send_mail")
    def test_hr_can_export_generated_worker_credentials_csv(self, _mock_send_mail):
        self.client.force_authenticate(user=self.hr)
        self.client.post(
            "/api/v1/users/workers/invite/",
            {
                "email": "csv.worker@example.com",
                "first_name": "CSV",
                "last_name": "Worker",
                "department": "Ops",
                "employee_id": "EMP-W-CSV",
            },
            format="json",
        )
        response = self.client.get("/api/v1/users/workers/invite-credentials/export/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/csv")
        self.assertIn("worker-invite-credentials.csv", response["Content-Disposition"])
        self.assertIn("csv.worker@example.com", response.content.decode("utf-8"))

    def test_worker_cannot_fetch_invite_credentials(self):
        self.client.force_authenticate(user=self.worker)
        response = self.client.get("/api/v1/users/workers/invite-credentials/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_hr_dashboard_overview_returns_expected_metrics(self):
        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.worker)
        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.other_worker)
        today = timezone.localdate()
        AttendanceRecord.objects.create(worker=self.worker, date=today, sign_in_time=timezone.now())
        MonthlyScore.objects.create(worker=self.worker, year=today.year, month=today.month, current_score=85)
        MonthlyScore.objects.create(worker=self.other_worker, year=today.year, month=today.month, current_score=65)
        DailyLog.objects.create(worker=self.worker, date=today, status=DailyLog.STATUS_SUBMITTED, ai_score_impact=2)

        self.client.force_authenticate(user=self.hr)
        response = self.client.get("/api/v1/users/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "hr")
        self.assertEqual(response.data["total_workers"], 2)
        self.assertEqual(response.data["today_attendance_count"], 1)
        self.assertAlmostEqual(response.data["average_team_score"], 75.0)
        self.assertEqual(response.data["flagged_count"], 1)
        self.assertEqual(response.data["tier_distribution"]["solid"], 1)
        self.assertEqual(response.data["tier_distribution"]["flagged"], 1)
        self.assertEqual(response.data["tier_distribution"]["elite"], 0)
        self.assertEqual(response.data["tier_distribution"]["standard"], 0)
        self.assertEqual(len(response.data["recent_worker_logs"]), 1)
        self.assertNotIn("active_today", response.data)
        self.assertNotIn("avg_team_score", response.data)

    def test_hr_dashboard_empty_returns_zeros(self):
        self.client.force_authenticate(user=self.hr)
        response = self.client.get("/api/v1/users/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_workers"], 0)
        self.assertEqual(response.data["today_attendance_count"], 0)
        self.assertEqual(response.data["average_team_score"], 0.0)
        self.assertEqual(response.data["flagged_count"], 0)
        self.assertEqual(len(response.data["recent_worker_logs"]), 0)

    def test_worker_dashboard_overview_returns_expected_metrics(self):
        today = timezone.localdate()
        sign_in = timezone.now()
        sign_out = sign_in + timedelta(hours=8)
        AttendanceRecord.objects.create(worker=self.worker, date=today, sign_in_time=sign_in, sign_out_time=sign_out)
        MonthlyScore.objects.create(worker=self.worker, year=today.year, month=today.month, current_score=92)
        DailyLog.objects.create(worker=self.worker, date=today, status=DailyLog.STATUS_SUBMITTED, ai_score_impact=1)

        self.client.force_authenticate(user=self.worker)
        response = self.client.get("/api/v1/users/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "worker")
        self.assertEqual(response.data["current_activity_score"], 92)
        self.assertEqual(response.data["tier"], "elite")
        self.assertEqual(response.data["today_session"]["status"], "signed_out")
        self.assertTrue(response.data["today_log_submitted"])
        self.assertIn("attendance_rate", response.data)
        self.assertIn("weekly_hours", response.data)
        self.assertIn("recent_attendance_sessions", response.data)
        self.assertNotIn("current_score", response.data)
        self.assertNotIn("session_active", response.data)

    def test_worker_dashboard_no_attendance_returns_not_started(self):
        today = timezone.localdate()
        self.client.force_authenticate(user=self.worker)
        response = self.client.get("/api/v1/users/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "worker")
        self.assertEqual(response.data["today_session"]["status"], "not_started")
        self.assertFalse(response.data["today_log_submitted"])
        self.assertEqual(response.data["current_activity_score"], 100)

    def test_dashboard_requires_authentication(self):
        response = self.client.get("/api/v1/users/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_worker_detail_requires_assignment_to_hr(self):
        self.client.force_authenticate(user=self.hr)
        missing = self.client.get(f"/api/v1/users/workers/{self.worker.id}/")
        self.assertEqual(missing.status_code, status.HTTP_404_NOT_FOUND)

        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.worker)
        found = self.client.get(f"/api/v1/users/workers/{self.worker.id}/")
        self.assertEqual(found.status_code, status.HTTP_200_OK)
        self.assertEqual(found.data["id"], self.worker.id)

    def test_logout_blacklists_refresh_token(self):
        refresh = RefreshToken.for_user(self.hr)
        self.client.force_authenticate(user=self.hr)
        response = self.client.post("/api/v1/auth/logout/", {"refresh": str(refresh)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post("/api/v1/auth/refresh/", {"refresh": str(refresh)}, format="json")
        self.assertIn(refresh_response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED])

    @patch("apps.users.views.urlopen")
    def test_users_banks_returns_bank_data(self, mock_urlopen):
        body = MagicMock()
        body.read.return_value = b'{"status": true, "data": [{"name": "GTBank", "code": "058"}]}'
        mock_urlopen.return_value.__enter__.return_value = body

        self.client.force_authenticate(user=self.hr)
        with patch("apps.users.views.os.getenv") as mock_getenv:
            mock_getenv.side_effect = lambda key, default=None: {
                "SQUAD_API_KEY": "test-key",
                "SQUAD_BASE_URL": "https://sandbox.thesquad.io",
            }.get(key, default)
            response = self.client.get("/api/v1/users/banks/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["banks"][0]["name"], "GTBank")
