import os

_env = os.getenv("DJANGO_ENV", "development").strip().lower()

if _env == "production":
    from .production import *  # noqa: F401,F403
elif _env == "base":
    from .base import *  # noqa: F401,F403
else:
    from .development import *  # noqa: F401,F403
