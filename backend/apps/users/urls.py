from django.urls import path

from .views import (
    MeView,
    UsersBanksView,
    WorkerAssignView,
    WorkerDetailView,
    WorkerInviteCredentialsExportView,
    WorkerInviteCredentialsView,
    WorkerListView,
    WorkerInviteView,
    WorkerBulkInviteView,
    DashboardOverviewView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="users-me"),
    path("workers/", WorkerListView.as_view(), name="users-workers"),
    path("workers/<int:worker_id>/", WorkerDetailView.as_view(), name="users-worker-detail"),
    path("workers/assign/", WorkerAssignView.as_view(), name="users-worker-assign"),
    path("workers/invite/", WorkerInviteView.as_view(), name="users-worker-invite"),
    path("workers/invite-bulk/", WorkerBulkInviteView.as_view(), name="users-worker-invite-bulk"),
    path("workers/invite-credentials/", WorkerInviteCredentialsView.as_view(), name="users-worker-invite-credentials"),
    path(
        "workers/invite-credentials/export/",
        WorkerInviteCredentialsExportView.as_view(),
        name="users-worker-invite-credentials-export",
    ),
    path("banks/", UsersBanksView.as_view(), name="users-banks"),
    path("dashboard/", DashboardOverviewView.as_view(), name="users-dashboard"),
]
