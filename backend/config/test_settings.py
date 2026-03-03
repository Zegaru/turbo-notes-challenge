"""
Test settings - uses SQLite in-memory for fast tests.
"""

from .settings import *  # noqa: F401, F403

SECRET_KEY = "test-secret-key-at-least-32-chars-for-jwt-signing"
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}
