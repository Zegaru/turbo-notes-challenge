import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestSignup:
    def test_signup_creates_user_and_returns_tokens(self):
        client = APIClient()
        response = client.post(
            "/api/signup/",
            {"email": "user@example.com", "password": "secret123"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data
        assert User.objects.filter(email="user@example.com").exists()

    def test_signup_rejects_duplicate_email(self):
        client = APIClient()
        client.post(
            "/api/signup/",
            {"email": "dup@example.com", "password": "secret123"},
            format="json",
        )
        response = client.post(
            "/api/signup/",
            {"email": "dup@example.com", "password": "other456"},
            format="json",
        )
        assert response.status_code == 400

    def test_signup_rejects_invalid_email(self):
        client = APIClient()
        response = client.post(
            "/api/signup/",
            {"email": "not-an-email", "password": "secret123"},
            format="json",
        )
        assert response.status_code == 400

    def test_signup_rejects_short_password(self):
        client = APIClient()
        response = client.post(
            "/api/signup/",
            {"email": "user@example.com", "password": "short"},
            format="json",
        )
        assert response.status_code == 400

    def test_signup_rejects_missing_fields(self):
        client = APIClient()
        response = client.post("/api/signup/", {}, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_login_returns_tokens_for_valid_credentials(self):
        User.objects.create_user(
            username="login@example.com",
            email="login@example.com",
            password="secret123",
        )
        client = APIClient()
        response = client.post(
            "/api/token/",
            {"username": "login@example.com", "password": "secret123"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data

    def test_login_rejects_invalid_password(self):
        User.objects.create_user(
            username="login@example.com",
            email="login@example.com",
            password="secret123",
        )
        client = APIClient()
        response = client.post(
            "/api/token/",
            {"username": "login@example.com", "password": "wrong"},
            format="json",
        )
        assert response.status_code == 401

    def test_login_rejects_nonexistent_user(self):
        client = APIClient()
        response = client.post(
            "/api/token/",
            {"username": "nobody@example.com", "password": "secret123"},
            format="json",
        )
        assert response.status_code == 401


@pytest.mark.django_db
class TestTokenRefresh:
    def test_token_refresh_returns_new_access(self):
        user = User.objects.create_user(
            username="refresh@example.com",
            email="refresh@example.com",
            password="secret123",
        )
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        client = APIClient()
        response = client.post(
            "/api/token/refresh/",
            {"refresh": str(refresh)},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data

    def test_token_refresh_rejects_invalid_token(self):
        client = APIClient()
        response = client.post(
            "/api/token/refresh/",
            {"refresh": "invalid-token"},
            format="json",
        )
        assert response.status_code == 401
