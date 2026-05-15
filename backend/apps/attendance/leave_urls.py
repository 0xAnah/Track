from django.urls import path

from .views import LeaveApproveView, LeaveRejectView, LeaveRequestCreateView, MyLeaveRequestsView, PendingLeaveRequestsView

urlpatterns = [
    path("request/", LeaveRequestCreateView.as_view(), name="leave-request"),
    path("my-requests/", MyLeaveRequestsView.as_view(), name="leave-my-requests"),
    path("pending/", PendingLeaveRequestsView.as_view(), name="leave-pending"),
    path("<int:leave_id>/approve/", LeaveApproveView.as_view(), name="leave-approve"),
    path("<int:leave_id>/reject/", LeaveRejectView.as_view(), name="leave-reject"),
]
