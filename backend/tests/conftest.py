import pytest

pytest_plugins = ["pytest_django"]


@pytest.fixture(autouse=True)
def _password_hashers(settings):
    settings.PASSWORD_HASHERS = [
        "django.contrib.auth.hashers.MD5PasswordHasher",
    ]
