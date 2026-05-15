from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase
from django.utils import timezone

from apps.attendance.models import AttendanceRecord, LeaveRequest
from apps.users.models import CustomUser

User = get_user_model()


class AttendanceModelsTests(TestCase):
    def setUp(self):
        self.worker = User.objects.create_user(
            username="worker-model-att",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-MODEL-ATT",
        )

    def test_attendance_is_unique_per_worker_per_date(self):
        today = timezone.localdate()
        AttendanceRecord.objects.create(worker=self.worker, date=today)
        with self.assertRaises(IntegrityError):
            AttendanceRecord.objects.create(worker=self.worker, date=today)

    def test_leave_request_status_defaults_to_pending(self):
        today = timezone.localdate()
        leave = LeaveRequest.objects.create(worker=self.worker, start_date=today, end_date=today, reason="Reason")
        self.assertEqual(leave.status, LeaveRequest.STATUS_PENDING)
