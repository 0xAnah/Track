from django.urls import path

from .views import MyScoreView, TeamScoresView, WorkerDeductionsView, WorkerScoreView

urlpatterns = [
    path("mine/", MyScoreView.as_view(), name="scores-mine"),
    path("worker/<int:worker_id>/", WorkerScoreView.as_view(), name="scores-worker"),
    path("team/", TeamScoresView.as_view(), name="scores-team"),
    path("deductions/<int:worker_id>/", WorkerDeductionsView.as_view(), name="scores-deductions"),
]
