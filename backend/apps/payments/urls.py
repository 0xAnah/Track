from django.urls import path

from .views import (
    AdvanceHistoryView,
    MyBankAccountView,
    MyPaymentStatusView,
    PaymentsBanksView,
    RegisterBankAccountView,
    ReleaseHeldSalaryView,
    RequestSalaryAdvanceView,
    SquadWebhookView,
    TeamPaymentsSummaryView,
    TransferStatusView,
)

urlpatterns = [
    path("banks/", PaymentsBanksView.as_view(), name="payments-banks"),
    path("bank-account/register/", RegisterBankAccountView.as_view(), name="payments-bank-register"),
    path("bank-account/mine/", MyBankAccountView.as_view(), name="payments-bank-mine"),
    path("mine/", MyPaymentStatusView.as_view(), name="payments-mine"),
    path("advance/request/", RequestSalaryAdvanceView.as_view(), name="payments-advance-request"),
    path("advance/history/", AdvanceHistoryView.as_view(), name="payments-advance-history"),
    path("team/summary/", TeamPaymentsSummaryView.as_view(), name="payments-team-summary"),
    path("release/<int:disbursement_id>/", ReleaseHeldSalaryView.as_view(), name="payments-release"),
    path("webhook/squad/", SquadWebhookView.as_view(), name="payments-webhook-squad"),
    path("transfer-status/<str:transaction_reference>/", TransferStatusView.as_view(), name="payments-transfer-status"),
]
