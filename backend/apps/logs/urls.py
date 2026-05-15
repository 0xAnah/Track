from django.urls import path

from .views import LogSubmitView, MyLogHistoryView, TodayLogView, WorkerLogByDateView, WorkerLogHistoryView

urlpatterns = [
    path("submit/", LogSubmitView.as_view(), name="logs-submit"),
    path("today/", TodayLogView.as_view(), name="logs-today"),
    path("my-history/", MyLogHistoryView.as_view(), name="logs-my-history"),
    path("worker/<int:worker_id>/", WorkerLogHistoryView.as_view(), name="logs-worker-history"),
    path("worker/<int:worker_id>/date/<str:day>/", WorkerLogByDateView.as_view(), name="logs-worker-date"),
]
