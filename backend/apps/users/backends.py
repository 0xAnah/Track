from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None:
            return None

        identifier = str(username).strip()
        if not identifier:
            return None

        # Prefer email lookup first, then username.
        # Use case-insensitive matching to avoid false 401s from casing differences.
        user = (
            User.objects.filter(email__iexact=identifier).order_by("id").first()
            or User.objects.filter(username__iexact=identifier).order_by("id").first()
        )
        if user is None:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
