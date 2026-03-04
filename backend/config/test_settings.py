"""
Test settings - uses SQLite in-memory for fast tests.
"""

import tempfile

from .settings import *  # noqa: F401, F403

SECRET_KEY = "test-secret-key-at-least-32-chars-for-jwt-signing"
AI_PROVIDER = "mock"
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}
MEDIA_ROOT = tempfile.mkdtemp()
