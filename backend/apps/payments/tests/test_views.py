from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.payments.models import SalaryAdvanceRequest, SalaryDisbursement, WorkerBankAccount
from apps.scoring.models import MonthlyScore
from apps.users.models import CustomUser, HRWorkerAssignment

User = get_user_model()


class PaymentsViewsTests(APITestCase):
    def setUp(self):
        self.hr = User.objects.create_user(
            username="hr-payments",
            password="Pass123!@#",
            role=CustomUser.ROLE_HR,
            employee_id="EMP-HR-PAY",
        )
        self.worker = User.objects.create_user(
            username="worker-payments",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-PAY",
        )
        self.other_worker = User.objects.create_user(
            username="worker-payments-2",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-PAY-2",
        )
        HRWorkerAssignment.objects.create(hr=self.hr, worker=self.worker)
        MonthlyScore.objects.create(worker=self.worker, year=2026, month=5, current_score=90)

    @patch("apps.payments.views.SquadClient")
    def test_register_bank_account(self, mock_client_cls):
        mock_client = mock_client_cls.return_value
        mock_client.verify_bank_account.return_value = {"account_name": "Worker Name", "bank_name": "GTBank"}
        self.client.force_authenticate(user=self.worker)
        response = self.client.post(
            "/api/v1/payments/bank-account/register/",
            {"account_number": "0123456789", "bank_code": "058", "monthly_salary": "120000.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(WorkerBankAccount.objects.filter(worker=self.worker, is_verified=True).exists())

    @patch("apps.payments.services.SquadClient")
    def test_request_advance(self, mock_client_cls):
        WorkerBankAccount.objects.create(
            worker=self.worker,
            account_number="0123456789",
            bank_code="058",
            bank_name="GTBank",
            account_name="Worker Name",
            monthly_salary=Decimal("100000.00"),
            is_verified=True,
        )
        mock_client = mock_client_cls.return_value
        mock_client.initiate_transfer.return_value = {"transaction_reference": "VF-ADV-2-202605"}

        self.client.force_authenticate(user=self.worker)
        response = self.client.post(
            "/api/v1/payments/advance/request/?month=5&year=2026",
            {"requested_amount": "30000.00", "reason": "Emergency"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SalaryAdvanceRequest.objects.filter(worker=self.worker).exists())

    def test_team_summary_hr_scope(self):
        SalaryDisbursement.objects.create(
            worker=self.worker,
            year=2026,
            month=5,
            base_salary=Decimal("100000.00"),
            bonus_amount=Decimal("1000.00"),
            advance_deduction=Decimal("0.00"),
            net_amount=Decimal("101000.00"),
            performance_tier=SalaryDisbursement.TIER_SOLID,
            integrity_score=85,
            status=SalaryDisbursement.STATUS_PENDING,
        )
        self.client.force_authenticate(user=self.hr)
        response = self.client.get("/api/v1/payments/team/summary/?month=5&year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["worker_id"], self.worker.id)

    @patch("apps.payments.views.verify_squad_signature")
    @patch("apps.payments.views.process_squad_webhook")
    def test_webhook_returns_processed(self, mock_process, mock_verify):
        mock_verify.return_value = True
        mock_process.return_value = {"processed": True}
        response = self.client.post(
            "/api/v1/payments/webhook/squad/",
            data={"TransactionRef": "VF-SAL-1-202605"},
            format="json",
            HTTP_X_SQUAD_ENCRYPTED_BODY="sig",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["processed"])
