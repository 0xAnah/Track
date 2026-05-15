import json
import os
import csv
from datetime import date, timedelta
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from django.conf import settings
from django.http import HttpResponse
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.utils.crypto import get_random_string
from kombu.exceptions import OperationalError
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from tasks.email_tasks import send_verification_email, send_verification_email_now
from apps.attendance.models import AttendanceRecord
from apps.logs.models import DailyLog
from apps.scoring.models import MonthlyScore
from apps.scoring.services import get_tier_for_score
from .models import CustomUser, HRWorkerAssignment, WorkerInviteCredential
from .permissions import IsHR
from .serializers import (
    HRSignupSerializer,
    LoginSerializer,
    LogoutSerializer,
    UserSerializer,
    WorkerAssignmentSerializer,
    WorkerSignupSerializer,
    WorkerInviteSerializer,
    BulkWorkerInviteSerializer,
    WorkerInviteCredentialSerializer,
)

User = get_user_model()


def _is_console_email_backend():
    return settings.EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend"


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({"detail": "User account is inactive."}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except AttributeError as exc:
            raise APIException("Token blacklist app is not configured.") from exc
        except TokenError:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


class HRRequestVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get("email")
            first_name = request.data.get("first_name", "User")
            
            if not email:
                return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
                
            if User.objects.filter(email=email).exists():
                return Response({"detail": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

            code = get_random_string(length=5, allowed_chars="0123456789")
            cache.set(f"hr_verify_{email}", code, timeout=600)  # 10 mins

            subject = "Track Workspace Verification Code"
            message = f"Hello {first_name},\n\nYour Track verification code is: {code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email."
            
            # Try broker-backed async delivery first; if broker is unavailable,
            # fall back to direct send so signup still works.
            try:
                send_verification_email.delay(email, subject, message)
            except OperationalError:
                send_verification_email_now(email, subject, message)
            
            response_data = {"detail": "Verification code sent."}
            if _is_console_email_backend():
                response_data["verification_code"] = code
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HRVerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return Response({"detail": "Email and code are required."}, status=status.HTTP_400_BAD_REQUEST)

        cached_code = cache.get(f"hr_verify_{email}")
        
        if not cached_code:
            return Response({"detail": "Verification code expired or not found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
            
        if cached_code != code:
            return Response({"detail": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)

        # Mark as verified so HRSignupView could theoretically check this, 
        # but the frontend will proceed to the next step anyway.
        cache.set(f"hr_verified_{email}", True, timeout=3600)
        cache.delete(f"hr_verify_{email}")
        
        return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)


class HRSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = HRSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class WorkerSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = WorkerSignupSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class WorkerInviteView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def _invite_worker(self, hr_user, worker_data):
        password = get_random_string(length=12)
        email = worker_data.get("email")
        first_name = worker_data.get("first_name", "")
        last_name = worker_data.get("last_name", "")
        username = email.split("@")[0]
        
        # Ensure unique username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            department=worker_data.get("department", ""),
            employee_id=worker_data.get("employee_id"),
            role=CustomUser.ROLE_WORKER,
            company_name=hr_user.company_name,
        )
        user.set_password(password)
        user.save()

        HRWorkerAssignment.objects.create(hr=hr_user, worker=user)

        # Send Email
        subject = "Welcome to Track Workspace"
        message = (
            f"Hello {first_name},\n\n"
            f"You have been invited to join the Track Workspace by your HR Manager.\n\n"
            f"Your login credentials are as follows:\n"
            f"Email/Username: {email}\n"
            f"Password: {password}\n\n"
            f"Please log in and change your password as soon as possible.\n\n"
            f"Best regards,\nThe Track Team"
        )
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL if hasattr(settings, "DEFAULT_FROM_EMAIL") else "noreply@track.com",
            [email],
            fail_silently=False,
        )
        WorkerInviteCredential.objects.create(
            hr=hr_user,
            worker=user,
            email=email,
            username=username,
            temporary_password=password,
        )
        return user, password

    def post(self, request):
        serializer = WorkerInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if email already exists
        if User.objects.filter(email=serializer.validated_data["email"]).exists():
            return Response({"detail": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user, password = self._invite_worker(request.user, serializer.validated_data)

        response_data = UserSerializer(user).data
        if _is_console_email_backend():
            response_data["temporary_password"] = password
        return Response(response_data, status=status.HTTP_201_CREATED)


class WorkerBulkInviteView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def post(self, request):
        serializer = BulkWorkerInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        workers_data = serializer.validated_data["workers"]
        created_users = []
        generated_credentials = []
        errors = []

        with transaction.atomic():
            for idx, worker_data in enumerate(workers_data):
                email = worker_data.get("email")
                if User.objects.filter(email=email).exists():
                    errors.append({"row": idx + 1, "email": email, "detail": "Email already exists."})
                    continue
                
                # Reuse the invite logic
                invite_view = WorkerInviteView()
                user, password = invite_view._invite_worker(request.user, worker_data)
                created_users.append(user)
                generated_credentials.append({"email": user.email, "temporary_password": password})

        response_data = {
            "detail": f"Successfully invited {len(created_users)} workers.",
            "errors": errors,
            "created": UserSerializer(created_users, many=True).data,
        }
        if _is_console_email_backend():
            response_data["generated_credentials"] = generated_credentials

        return Response(
            response_data,
            status=status.HTTP_201_CREATED if created_users else status.HTTP_400_BAD_REQUEST,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class WorkerListView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        worker_ids = HRWorkerAssignment.objects.filter(hr=request.user).values_list("worker_id", flat=True)
        workers = User.objects.filter(id__in=worker_ids).order_by("id")
        return Response(UserSerializer(workers, many=True).data, status=status.HTTP_200_OK)


class WorkerDetailView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, worker_id: int):
        try:
            assignment = HRWorkerAssignment.objects.select_related("worker").get(hr=request.user, worker_id=worker_id)
        except HRWorkerAssignment.DoesNotExist:
            return Response({"detail": "Worker not found for this HR."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(assignment.worker).data, status=status.HTTP_200_OK)


class WorkerAssignView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def post(self, request):
        serializer = WorkerAssignmentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        return Response(
            {
                "detail": "Worker assignment updated.",
                "worker_id": assignment.worker_id,
                "hr_id": assignment.hr_id,
            },
            status=status.HTTP_200_OK,
        )


class UsersBanksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, _request):
        api_key = os.getenv("SQUAD_API_KEY")
        base_url = os.getenv("SQUAD_BASE_URL", "https://sandbox.thesquad.io").rstrip("/")
        if not api_key:
            raise APIException("SQUAD_API_KEY is required to fetch banks.")

        request_obj = Request(
            url=f"{base_url}/bank",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="GET",
        )
        try:
            with urlopen(request_obj, timeout=15) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            return Response(
                {"detail": "Failed to fetch banks from Squad.", "status_code": exc.code},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except URLError as exc:
            return Response({"detail": f"Could not connect to Squad: {exc.reason}"}, status=status.HTTP_502_BAD_GATEWAY)

        banks = payload.get("data", payload)
        return Response({"banks": banks}, status=status.HTTP_200_OK)


class WorkerInviteCredentialsView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        credentials = (
            WorkerInviteCredential.objects.filter(hr=request.user)
            .select_related("worker")
            .order_by("-created_at")
        )
        return Response(WorkerInviteCredentialSerializer(credentials, many=True).data, status=status.HTTP_200_OK)


class WorkerInviteCredentialsExportView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        credentials = (
            WorkerInviteCredential.objects.filter(hr=request.user)
            .select_related("worker")
            .order_by("-created_at")
        )
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="worker-invite-credentials.csv"'

        writer = csv.writer(response)
        writer.writerow(["employee_name", "email", "username", "temporary_password", "created_at"])
        for credential in credentials:
            writer.writerow(
                [
                    f"{credential.worker.first_name} {credential.worker.last_name}".strip(),
                    credential.email,
                    credential.username,
                    credential.temporary_password,
                    credential.created_at.isoformat(),
                ]
            )
        return response


def _session_status(record):
    if not record or not record.sign_in_time:
        return "not_started"
    if record.sign_out_time:
        return "signed_out"
    return "signed_in"


def _duration_minutes(record):
    if not record or not record.sign_in_time or not record.sign_out_time:
        return 0
    duration = record.sign_out_time - record.sign_in_time
    return max(int(duration.total_seconds() // 60), 0)


def _format_worker_name(user):
    full_name = f"{user.first_name} {user.last_name}".strip()
    return full_name or user.username


def _working_days_this_month(today: date) -> int:
    first_day = today.replace(day=1)
    count = 0
    current = first_day
    while current <= today:
        if current.weekday() < 5:
            count += 1
        current += timedelta(days=1)
    return count


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        current_month = today.month
        current_year = today.year

        if user.role == CustomUser.ROLE_HR:
            return self._hr_dashboard(user, today, current_year, current_month)
        return self._worker_dashboard(user, today, current_year, current_month)

    def _hr_dashboard(self, user, today, year, month):
        worker_ids = list(
            HRWorkerAssignment.objects.filter(hr=user).values_list("worker_id", flat=True)
        )
        total_workers = len(worker_ids)
        if total_workers == 0:
            return Response(
                {
                    "role": "hr",
                    "total_workers": 0,
                    "today_attendance_count": 0,
                    "average_team_score": 0.0,
                    "flagged_count": 0,
                    "tier_distribution": {"elite": 0, "solid": 0, "standard": 0, "flagged": 0},
                    "recent_worker_logs": [],
                },
                status=status.HTTP_200_OK,
            )

        today_attendance_count = AttendanceRecord.objects.filter(
            worker_id__in=worker_ids, date=today, sign_in_time__isnull=False
        ).count()

        scores = MonthlyScore.objects.filter(
            worker_id__in=worker_ids, year=year, month=month
        )
        score_map = {s.worker_id: s.current_score for s in scores}
        total_score = sum(score_map.values()) + (total_workers - len(score_map)) * 100
        average_team_score = round(total_score / total_workers, 1)

        tier_distribution = {"elite": 0, "solid": 0, "standard": 0, "flagged": 0}
        for s in score_map.values():
            tier = get_tier_for_score(s)
            tier_distribution[tier] += 1
        flagged_count = tier_distribution["flagged"]

        recent_logs = (
            DailyLog.objects.filter(worker_id__in=worker_ids)
            .select_related("worker")
            .annotate(task_count=Count("task_entries"))
            .order_by("-submitted_at", "-date", "-id")[:8]
        )

        return Response(
            {
                "role": "hr",
                "total_workers": total_workers,
                "today_attendance_count": today_attendance_count,
                "average_team_score": average_team_score,
                "flagged_count": flagged_count,
                "tier_distribution": tier_distribution,
                "recent_worker_logs": [
                    {
                        "id": log.id,
                        "worker_id": log.worker_id,
                        "worker_name": _format_worker_name(log.worker),
                        "date": str(log.date),
                        "status": log.status,
                        "ai_score_impact": log.ai_score_impact,
                        "task_count": log.task_count,
                        "submitted_at": log.submitted_at.isoformat() if log.submitted_at else None,
                    }
                    for log in recent_logs
                ],
            },
            status=status.HTTP_200_OK,
        )

    def _worker_dashboard(self, user, today, year, month):
        today_record = AttendanceRecord.objects.filter(worker=user, date=today).first()

        working_days = _working_days_this_month(today)
        attended_days = AttendanceRecord.objects.filter(
            worker=user, date__year=year, date__month=month, sign_in_time__isnull=False
        ).count()
        attendance_rate = round((attended_days / working_days) * 100, 1) if working_days else 0.0

        score = MonthlyScore.objects.filter(worker=user, year=year, month=month).first()
        current_activity_score = score.current_score if score else 100

        today_log_submitted = DailyLog.objects.filter(worker=user, date=today).exists()
        recent_logs = (
            DailyLog.objects.filter(worker=user)
            .order_by("-submitted_at", "-date", "-id")[:8]
        )

        weekly_records = AttendanceRecord.objects.filter(
            worker=user, date__gte=today - timedelta(days=6), date__lte=today
        ).order_by("date")

        return Response(
            {
                "role": "worker",
                "current_activity_score": current_activity_score,
                "tier": get_tier_for_score(current_activity_score),
                "attendance_rate": attendance_rate,
                "today_session": {
                    "status": _session_status(today_record),
                    "sign_in_time": today_record.sign_in_time.isoformat() if today_record and today_record.sign_in_time else None,
                    "sign_out_time": today_record.sign_out_time.isoformat() if today_record and today_record.sign_out_time else None,
                },
                "today_log_submitted": today_log_submitted,
                "recent_logs": [
                    {
                        "id": log.id,
                        "date": str(log.date),
                        "status": log.status,
                        "ai_score_impact": log.ai_score_impact,
                        "submitted_at": log.submitted_at.isoformat() if log.submitted_at else None,
                    }
                    for log in recent_logs
                ],
                "weekly_hours": [
                    {
                        "day": record.date.strftime("%a"),
                        "date": str(record.date),
                        "hours": round(_duration_minutes(record) / 60, 2),
                    }
                    for record in weekly_records
                ],
                "recent_attendance_sessions": [
                    {
                        "date": str(record.date),
                        "sign_in_time": record.sign_in_time.isoformat() if record.sign_in_time else None,
                        "sign_out_time": record.sign_out_time.isoformat() if record.sign_out_time else None,
                        "duration_minutes": _duration_minutes(record),
                        "status": _session_status(record),
                        "is_absent": record.is_absent,
                    }
                    for record in weekly_records.order_by("-date")
                ],
            },
            status=status.HTTP_200_OK,
        )
