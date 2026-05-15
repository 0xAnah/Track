from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import HRWorkerAssignment
from apps.users.permissions import IsHR, IsWorker

from .models import SalaryAdvanceRequest, SalaryDisbursement, WorkerBankAccount
from .serializers import (
    SalaryAdvanceCreateSerializer,
    SalaryAdvanceRequestSerializer,
    SalaryDisbursementSerializer,
    WorkerBankAccountRegisterSerializer,
    WorkerBankAccountSerializer,
)
from .services import disburse_salary, request_salary_advance, worker_payment_snapshot
from .squad_client import SquadAPIError, SquadClient
from .webhooks import process_squad_webhook, verify_squad_signature

User = get_user_model()


def _parse_month_year(request):
    today = date.today()
    month = int(request.query_params.get("month", today.month))
    year = int(request.query_params.get("year", today.year))
    if month < 1 or month > 12:
        raise ValueError("month must be between 1 and 12")
    return month, year


class PaymentsBanksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, _request):
        try:
            banks = SquadClient().get_bank_list()
        except SquadAPIError as exc:
            return Response({"detail": str(exc), "payload": exc.payload}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({"banks": banks}, status=status.HTTP_200_OK)


class RegisterBankAccountView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def post(self, request):
        serializer = WorkerBankAccountRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            lookup = SquadClient().verify_bank_account(
                account_number=data["account_number"],
                bank_code=data["bank_code"],
            )
        except SquadAPIError as exc:
            return Response({"detail": str(exc), "payload": exc.payload}, status=status.HTTP_502_BAD_GATEWAY)

        account = WorkerBankAccount.objects.filter(worker=request.user).first()
        if account is None:
            account = WorkerBankAccount(worker=request.user)
        account.account_number = data["account_number"]
        account.bank_code = data["bank_code"]
        account.monthly_salary = data["monthly_salary"]
        account.account_name = lookup.get("account_name") or lookup.get("accountName") or ""
        account.bank_name = lookup.get("bank_name") or lookup.get("bankName") or ""
        account.is_verified = True
        account.save()
        return Response(WorkerBankAccountSerializer(account).data, status=status.HTTP_200_OK)


class MyBankAccountView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        account = WorkerBankAccount.objects.filter(worker=request.user).first()
        if account is None:
            return Response({"detail": "No bank account registered."}, status=status.HTTP_404_NOT_FOUND)
        return Response(WorkerBankAccountSerializer(account).data, status=status.HTTP_200_OK)


class MyPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        try:
            month, year = _parse_month_year(request)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        snapshot = worker_payment_snapshot(request.user, year, month)
        disbursement = snapshot["disbursement"]
        return Response(
            {
                "year": year,
                "month": month,
                "integrity_score": snapshot["integrity_score"],
                "tier": snapshot["tier"],
                "advance_eligible": snapshot["advance_eligible"],
                "advance_limit": str(snapshot["advance_limit"]),
                "outstanding_advance": str(snapshot["outstanding_advance"]),
                "bank_account_verified": snapshot["bank_account_verified"],
                "disbursement": SalaryDisbursementSerializer(disbursement).data if disbursement else None,
            },
            status=status.HTTP_200_OK,
        )


class RequestSalaryAdvanceView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def post(self, request):
        serializer = SalaryAdvanceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            month, year = _parse_month_year(request)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            advance = request_salary_advance(
                worker=request.user,
                requested_amount=serializer.validated_data["requested_amount"],
                reason=serializer.validated_data["reason"],
                year=year,
                month=month,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except SquadAPIError as exc:
            return Response({"detail": str(exc), "payload": exc.payload}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(SalaryAdvanceRequestSerializer(advance).data, status=status.HTTP_201_CREATED)


class AdvanceHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsWorker]

    def get(self, request):
        queryset = SalaryAdvanceRequest.objects.filter(worker=request.user).order_by("-year", "-month", "-id")
        return Response(SalaryAdvanceRequestSerializer(queryset, many=True).data, status=status.HTTP_200_OK)


class TeamPaymentsSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        worker_ids = HRWorkerAssignment.objects.filter(hr=request.user).values_list("worker_id", flat=True)
        workers = User.objects.filter(id__in=worker_ids).order_by("id")
        try:
            month, year = _parse_month_year(request)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        rows = []
        for worker in workers:
            disbursement = SalaryDisbursement.objects.filter(worker=worker, year=year, month=month).first()
            rows.append(
                {
                    "worker_id": worker.id,
                    "worker_name": worker.get_full_name() or worker.username,
                    "disbursement": SalaryDisbursementSerializer(disbursement).data if disbursement else None,
                }
            )
        return Response(rows, status=status.HTTP_200_OK)


class ReleaseHeldSalaryView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def post(self, request, disbursement_id: int):
        try:
            disbursement = SalaryDisbursement.objects.select_related("worker").get(id=disbursement_id)
        except SalaryDisbursement.DoesNotExist:
            return Response({"detail": "Disbursement not found."}, status=status.HTTP_404_NOT_FOUND)

        assigned = HRWorkerAssignment.objects.filter(hr=request.user, worker=disbursement.worker).exists()
        if not assigned:
            return Response({"detail": "Worker not found for this HR."}, status=status.HTTP_404_NOT_FOUND)
        if disbursement.status != SalaryDisbursement.STATUS_HELD:
            return Response({"detail": "Only held disbursements can be released."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refreshed = disburse_salary(
                worker=disbursement.worker,
                year=disbursement.year,
                month=disbursement.month,
                release_held=True,
            )
        except (ValueError, SquadAPIError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(SalaryDisbursementSerializer(refreshed).data, status=status.HTTP_200_OK)


class TransferStatusView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, transaction_reference: str):
        worker_ids = HRWorkerAssignment.objects.filter(hr=request.user).values_list("worker_id", flat=True)
        disbursement = SalaryDisbursement.objects.filter(
            worker_id__in=worker_ids,
            squad_reference=transaction_reference,
        ).first()
        advance = SalaryAdvanceRequest.objects.filter(
            worker_id__in=worker_ids,
            squad_reference=transaction_reference,
        ).first()
        if not disbursement and not advance:
            return Response({"detail": "Transaction reference not found for this HR."}, status=status.HTTP_404_NOT_FOUND)

        try:
            transfer = SquadClient().get_transfer_status(transaction_reference)
        except SquadAPIError as exc:
            return Response({"detail": str(exc), "payload": exc.payload}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({"transfer": transfer}, status=status.HTTP_200_OK)


class SquadWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("x-squad-encrypted-body")
        raw = request.body
        if verify_squad_signature(raw, signature):
            result = process_squad_webhook(raw)
            return Response(result, status=status.HTTP_200_OK)
        return Response({"processed": False, "reason": "invalid_signature"}, status=status.HTTP_200_OK)
