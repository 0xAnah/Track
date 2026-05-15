from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.payments.models import SalaryAdvanceRequest, SalaryDisbursement, WorkerBankAccount
from apps.payments.services import (
    disburse_salary,
    generate_reference,
    naira_to_kobo,
    request_salary_advance,
)
from apps.scoring.models import MonthlyScore
from apps.users.models import CustomUser

User = get_user_model()


class PaymentServicesTests(TestCase):
    def setUp(self):
        self.worker = User.objects.create_user(
            username="worker-payment-services",
            password="Pass123!@#",
            role=CustomUser.ROLE_WORKER,
            employee_id="EMP-W-PAY-SVC",
        )
        WorkerBankAccount.objects.create(
            worker=self.worker,
            account_number="0123456789",
            bank_code="058",
            bank_name="GTBank",
            account_name="Worker Name",
            monthly_salary=Decimal("100000.00"),
            is_verified=True,
        )
        MonthlyScore.objects.create(worker=self.worker, year=2026, month=5, current_score=90)

    def test_naira_to_kobo(self):
        self.assertEqual(naira_to_kobo(Decimal("100.50")), 10050)

    def test_generate_reference(self):
        self.assertEqual(generate_reference("VF-SAL", 4, 2026, 5), "VF-SAL-4-202605")
        self.assertEqual(generate_reference("VF-SAL", 4, 2026, 5, "REL"), "VF-SAL-4-202605-REL")

    @patch("apps.payments.services.SquadClient")
    def test_disburse_salary_pending_with_reference(self, mock_client_cls):
        mock_client = mock_client_cls.return_value
        mock_client.initiate_transfer.return_value = {"transaction_reference": "VF-SAL-1-202605"}

        disbursement = disburse_salary(worker=self.worker, year=2026, month=5)
        self.assertEqual(disbursement.status, SalaryDisbursement.STATUS_PENDING)
        self.assertEqual(disbursement.squad_reference, "VF-SAL-1-202605")

    @patch("apps.payments.services.SquadClient")
    def test_request_salary_advance_disbursed(self, mock_client_cls):
        mock_client = mock_client_cls.return_value
        mock_client.initiate_transfer.return_value = {"transaction_reference": "VF-ADV-1-202605"}

        advance = request_salary_advance(
            worker=self.worker,
            requested_amount=Decimal("30000.00"),
            reason="Medical emergency",
            year=2026,
            month=5,
        )
        self.assertEqual(advance.status, SalaryAdvanceRequest.STATUS_DISBURSED)
        self.assertEqual(advance.squad_reference, "VF-ADV-1-202605")
