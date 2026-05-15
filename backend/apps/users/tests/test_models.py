from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase

from apps.users.models import CustomUser, HRWorkerAssignment

User = get_user_model()


class UserModelTests(TestCase):
    def test_hr_user_gets_company_signup_key(self):
        hr = User.objects.create_user(
            username="hr-model",
            password="Pass123!@#",
            role=CustomUser.ROLE_HR,
            company_name="Acme Corp",
        )
        self.assertTrue(hr.company_signup_key)
        self.assertTrue(hr.company_signup_key.startswith("HRK-"))

    def test_worker_user_does_not_keep_company_signup_key(self):
        worker = User.objects.create_user(
            username="worker-model",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            company_name="Acme Corp",
            company_signup_key="SHOULD-NOT-STAY",
        )
        self.assertIsNone(worker.company_signup_key)

    def test_hr_worker_assignment_unique_worker(self):
        hr1 = User.objects.create_user(username="hr-a", password="Pass123!@#", role=CustomUser.ROLE_HR)
        hr2 = User.objects.create_user(username="hr-b", password="Pass123!@#", role=CustomUser.ROLE_HR)
        worker = User.objects.create_user(username="worker-a", password="Pass123!@#", role=CustomUser.ROLE_WORKER)
        HRWorkerAssignment.objects.create(hr=hr1, worker=worker)
        with self.assertRaises(IntegrityError):
            HRWorkerAssignment.objects.create(hr=hr2, worker=worker)
