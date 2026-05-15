from datetime import time, timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.logs.models import DailyLog, TaskEntry
from apps.users.models import CustomUser, HRWorkerAssignment

User = get_user_model()


class LogsViewTests(APITestCase):
    def setUp(self):
        self.hr = User.objects.create_user(
            username="hr-logs",
            password="Pass123!@#",
            role=CustomUser.ROLE_HR,
            employee_id="EMP-HR-LOGS",
        )
        self.worker = User.objects.create_user(
            username="worker-logs",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-LOGS",
        )
        self.other_worker = User.objects.create_user(
            username="worker-logs-2",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-LOGS-2",
        )
        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.worker)

    @patch("apps.logs.views.ai_analyze_submitted_log.delay")
    def test_worker_can_submit_log_and_trigger_ai_task(self, mock_delay):
        self.client.force_authenticate(user=self.worker)
        payload = {
            "tasks": [
                {
                    "title": "File review",
                    "description": "Reviewed procurement memo",
                    "initiated_by": "Director",
                    "handed_to": "Secretary",
                    "start_time": "09:00:00",
                    "end_time": "10:00:00",
                }
            ]
        }
        response = self.client.post("/api/v1/logs/submit/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        log = DailyLog.objects.get(worker=self.worker, date=timezone.localdate())
        self.assertEqual(log.status, DailyLog.STATUS_SUBMITTED)
        self.assertEqual(log.task_entries.count(), 1)
        mock_delay.assert_called_once_with(log.id)

    @patch("apps.logs.views.ai_analyze_submitted_log.delay")
    def test_worker_can_submit_log_without_chain_fields(self, mock_delay):
        self.client.force_authenticate(user=self.worker)
        payload = {
            "tasks": [
                {
                    "title": "Code review",
                    "description": "Reviewed and merged pull requests",
                    "start_time": "11:00:00",
                    "end_time": "12:00:00",
                }
            ]
        }
        response = self.client.post("/api/v1/logs/submit/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        entry = TaskEntry.objects.get(daily_log__worker=self.worker, daily_log__date=timezone.localdate())
        self.assertEqual(entry.initiated_by, "")
        self.assertEqual(entry.handed_to, "")
        mock_delay.assert_called_once()

    @patch("apps.logs.views.ai_analyze_submitted_log.delay")
    def test_worker_cannot_submit_twice(self, mock_delay):
        self.client.force_authenticate(user=self.worker)
        DailyLog.objects.create(
            worker=self.worker,
            date=timezone.localdate(),
            status=DailyLog.STATUS_SUBMITTED,
            submitted_at=timezone.now(),
        )
        response = self.client.post(
            "/api/v1/logs/submit/",
            {
                "tasks": [
                    {
                        "title": "Task",
                        "description": "Desc",
                        "initiated_by": "A",
                        "handed_to": "B",
                        "start_time": "09:00:00",
                        "end_time": "10:00:00",
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_delay.assert_not_called()

    def test_today_and_history_endpoints_for_worker(self):
        today = timezone.localdate()
        log = DailyLog.objects.create(worker=self.worker, date=today, status=DailyLog.STATUS_VERIFIED, ai_analysis="ok")
        TaskEntry.objects.create(
            daily_log=log,
            title="Task",
            description="Desc",
            initiated_by="A",
            handed_to="B",
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        self.client.force_authenticate(user=self.worker)
        today_resp = self.client.get("/api/v1/logs/today/")
        self.assertEqual(today_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(today_resp.data["id"], log.id)

        history = self.client.get(f"/api/v1/logs/my-history/?month={today.month}&year={today.year}")
        self.assertEqual(history.status_code, status.HTTP_200_OK)
        self.assertEqual(len(history.data), 1)

    def test_hr_can_view_assigned_worker_logs_by_month_and_date(self):
        today = timezone.localdate()
        log = DailyLog.objects.create(worker=self.worker, date=today, status=DailyLog.STATUS_VERIFIED)
        self.client.force_authenticate(user=self.hr)

        month_resp = self.client.get(f"/api/v1/logs/worker/{self.worker.id}/?month={today.month}&year={today.year}")
        self.assertEqual(month_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(month_resp.data), 1)

        date_resp = self.client.get(f"/api/v1/logs/worker/{self.worker.id}/date/{today.isoformat()}/")
        self.assertEqual(date_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(date_resp.data["id"], log.id)

        blocked = self.client.get(f"/api/v1/logs/worker/{self.other_worker.id}/")
        self.assertEqual(blocked.status_code, status.HTTP_404_NOT_FOUND)

    def test_submit_rejects_non_today_date(self):
        self.client.force_authenticate(user=self.worker)
        yesterday = timezone.localdate() - timedelta(days=1)
        response = self.client.post(
            "/api/v1/logs/submit/",
            {
                "date": yesterday.isoformat(),
                "tasks": [
                    {
                        "title": "Task",
                        "description": "Desc",
                        "initiated_by": "A",
                        "handed_to": "B",
                        "start_time": "09:00:00",
                        "end_time": "10:00:00",
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
