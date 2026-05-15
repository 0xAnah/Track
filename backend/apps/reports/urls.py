from django.urls import path

from . import views

app_name = "reports"

urlpatterns = [
    path("monthly/", views.MonthlyReportView.as_view(), name="monthly"),
    path("generate/", views.GenerateReportView.as_view(), name="generate"),
    path("flagged/<int:pk>/review/", views.ReviewFlaggedWorkerView.as_view(), name="review"),
]
