from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.attendance.models import AttendanceRecord, LeaveRequest
from apps.users.models import CustomUser, HRWorkerAssignment

User = get_user_model()


class AttendanceAndLeaveViewTests(APITestCase):
    def setUp(self):
        self.hr = User.objects.create_user(
            username="hr-att",
            password="Pass123!@#",
            role=CustomUser.ROLE_HR,
            employee_id="EMP-HR-ATT",
        )
        self.worker = User.objects.create_user(
            username="worker-att",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-ATT",
        )
        self.other_worker = User.objects.create_user(
            username="worker-att-2",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-ATT-2",
        )
        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.worker)

    def test_worker_can_sign_in_and_sign_out_once(self):
        self.client.force_authenticate(user=self.worker)
        sign_in = self.client.post("/api/v1/attendance/sign-in/", {}, format="json")
        self.assertEqual(sign_in.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(sign_in.data["sign_in_time"])

        sign_in_again = self.client.post("/api/v1/attendance/sign-in/", {}, format="json")
        self.assertEqual(sign_in_again.status_code, status.HTTP_400_BAD_REQUEST)

        sign_out = self.client.post("/api/v1/attendance/sign-out/", {}, format="json")
        self.assertEqual(sign_out.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(sign_out.data["sign_out_time"])

        sign_out_again = self.client.post("/api/v1/attendance/sign-out/", {}, format="json")
        self.assertEqual(sign_out_again.status_code, status.HTTP_400_BAD_REQUEST)

    def test_today_endpoint_returns_404_when_missing(self):
        self.client.force_authenticate(user=self.worker)
        response = self.client.get("/api/v1/attendance/today/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_my_history_returns_current_month_records(self):
        today = timezone.localdate()
        AttendanceRecord.objects.create(worker=self.worker, date=today, is_absent=False)
        AttendanceRecord.objects.create(worker=self.worker, date=today - timedelta(days=1), is_absent=True)
        AttendanceRecord.objects.create(worker=self.worker, date=today.replace(day=1) - timedelta(days=1), is_absent=True)

        self.client.force_authenticate(user=self.worker)
        response = self.client.get(f"/api/v1/attendance/my-history/?month={today.month}&year={today.year}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_hr_can_view_assigned_worker_attendance_only(self):
        today = timezone.localdate()
        AttendanceRecord.objects.create(worker=self.worker, date=today, is_absent=False)
        self.client.force_authenticate(user=self.hr)

        allowed = self.client.get(f"/api/v1/attendance/worker/{self.worker.id}/")
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(allowed.data), 1)

        blocked = self.client.get(f"/api/v1/attendance/worker/{self.other_worker.id}/")
        self.assertEqual(blocked.status_code, status.HTTP_404_NOT_FOUND)

    def test_worker_can_create_leave_and_list_own_requests(self):
        self.client.force_authenticate(user=self.worker)
        today = timezone.localdate()
        create = self.client.post(
            "/api/v1/leave/request/",
            {
                "start_date": str(today),
                "end_date": str(today + timedelta(days=2)),
                "reason": "Medical leave",
            },
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)

        own = self.client.get("/api/v1/leave/my-requests/")
        self.assertEqual(own.status_code, status.HTTP_200_OK)
        self.assertEqual(len(own.data), 1)
        self.assertEqual(own.data[0]["status"], LeaveRequest.STATUS_PENDING)

    def test_hr_pending_leave_shows_only_assigned_workers(self):
        today = timezone.localdate()
        LeaveRequest.objects.create(worker=self.worker, start_date=today, end_date=today, reason="Need day off")
        LeaveRequest.objects.create(worker=self.other_worker, start_date=today, end_date=today, reason="Other team")

        self.client.force_authenticate(user=self.hr)
        response = self.client.get("/api/v1/leave/pending/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["worker"], self.worker.id)

    def test_hr_can_approve_leave_and_mark_absence_excused(self):
        today = timezone.localdate()
        leave = LeaveRequest.objects.create(
            worker=self.worker,
            start_date=today,
            end_date=today + timedelta(days=1),
            reason="Family matter",
        )
        self.client.force_authenticate(user=self.hr)
        response = self.client.patch(f"/api/v1/leave/{leave.id}/approve/", {"hr_notes": "Approved"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        leave.refresh_from_db()
        self.assertEqual(leave.status, LeaveRequest.STATUS_APPROVED)
        self.assertEqual(leave.reviewed_by_id, self.hr.id)
        self.assertEqual(AttendanceRecord.objects.filter(worker=self.worker, absence_excused=True).count(), 2)

    def test_hr_can_reject_leave(self):
        today = timezone.localdate()
        leave = LeaveRequest.objects.create(worker=self.worker, start_date=today, end_date=today, reason="Travel")
        self.client.force_authenticate(user=self.hr)
        response = self.client.patch(f"/api/v1/leave/{leave.id}/reject/", {"hr_notes": "No backup"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        leave.refresh_from_db()
        self.assertEqual(leave.status, LeaveRequest.STATUS_REJECTED)

    def test_worker_cannot_approve_leave(self):
        today = timezone.localdate()
        leave = LeaveRequest.objects.create(worker=self.worker, start_date=today, end_date=today, reason="Travel")
        self.client.force_authenticate(user=self.worker)
        response = self.client.patch(f"/api/v1/leave/{leave.id}/approve/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
