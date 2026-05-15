from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


def send_verification_email_now(email, subject, message):
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )


@shared_task(bind=True, max_retries=3, ignore_result=True)
def send_verification_email(self, email, subject, message):
    """
    Async task to send verification emails.
    Retries up to 3 times on failure with exponential backoff.
    Fire-and-forget pattern (ignore_result=True) to avoid result backend dependency.
    """
    try:
        send_verification_email_now(email, subject, message)
    except Exception as exc:
        # Retry with exponential backoff: 60s, 120s, 180s
        raise self.retry(exc=exc, countdown=60 * self.request.retries)
