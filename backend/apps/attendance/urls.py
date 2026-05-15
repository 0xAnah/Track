from django.urls import path

from .views import MyAttendanceHistoryView, SignInView, SignOutView, TodayAttendanceView, WorkerAttendanceView

urlpatterns = [
    path("sign-in/", SignInView.as_view(), name="attendance-sign-in"),
    path("sign-out/", SignOutView.as_view(), name="attendance-sign-out"),
    path("today/", TodayAttendanceView.as_view(), name="attendance-today"),
    path("my-history/", MyAttendanceHistoryView.as_view(), name="attendance-my-history"),
    path("worker/<int:worker_id>/", WorkerAttendanceView.as_view(), name="attendance-worker"),
]
