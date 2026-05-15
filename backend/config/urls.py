from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.users.auth_urls")),
    path("api/v1/users/", include("apps.users.urls")),
    path("api/v1/attendance/", include("apps.attendance.urls")),
    path("api/v1/leave/", include("apps.attendance.leave_urls")),
    path("api/v1/logs/", include("apps.logs.urls")),
    path("api/v1/scoring/", include("apps.scoring.urls")),
    path("api/v1/scores/", include("apps.scoring.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
]
