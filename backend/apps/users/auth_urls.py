from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import HRSignupView, LoginView, LogoutView, WorkerSignupView, HRRequestVerificationView, HRVerifyCodeView

urlpatterns = [
    path("signup/hr/", HRSignupView.as_view(), name="auth-signup-hr"),
    path("signup/hr/request-verification/", HRRequestVerificationView.as_view(), name="auth-signup-hr-request-verification"),
    path("signup/hr/verify-code/", HRVerifyCodeView.as_view(), name="auth-signup-hr-verify-code"),
    path("signup/worker/", WorkerSignupView.as_view(), name="auth-signup-worker"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
]
