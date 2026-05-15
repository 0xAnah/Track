from datetime import time

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase
from django.utils import timezone

from apps.logs.models import DailyLog, TaskEntry
from apps.users.models import CustomUser

User = get_user_model()


class LogsModelsTests(TestCase):
    def setUp(self):
        self.worker = User.objects.create_user(
            username="worker-log-model",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-LOG-MODEL",
        )

    def test_daily_log_unique_per_worker_per_date(self):
        today = timezone.localdate()
        DailyLog.objects.create(worker=self.worker, date=today)
        with self.assertRaises(IntegrityError):
            DailyLog.objects.create(worker=self.worker, date=today)

    def test_task_entry_enforces_start_before_end(self):
        log = DailyLog.objects.create(worker=self.worker, date=timezone.localdate())
        with self.assertRaises(IntegrityError):
            TaskEntry.objects.create(
                daily_log=log,
                title="Task",
                description="Desc",
                initiated_by="Manager",
                handed_to="Officer",
                start_time=time(15, 0),
                end_time=time(14, 0),
            )
