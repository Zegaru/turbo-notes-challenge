import pytest
from core.models import Category
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture
def user():
    return User.objects.create_user(
        username="user@example.com",
        email="user@example.com",
        password="secret123",
    )


@pytest.fixture
def other_user():
    return User.objects.create_user(
        username="other@example.com",
        email="other@example.com",
        password="secret123",
    )


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestCategoryList:
    def test_returns_401_when_unauthenticated(self, api_client):
        response = api_client.get("/api/categories/")
        assert response.status_code == 401

    def test_returns_only_own_categories_when_authenticated(self, api_client, user, other_user):
        Category.objects.create(user=user, name="MyCat", color="orange")
        Category.objects.create(user=other_user, name="OtherCat", color="yellow")

        api_client.force_authenticate(user=user)
        response = api_client.get("/api/categories/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "MyCat"


@pytest.mark.django_db
class TestCategoryCreate:
    def test_returns_401_when_unauthenticated(self, api_client):
        response = api_client.post(
            "/api/categories/",
            {"name": "Work", "color": "orange"},
            format="json",
        )
        assert response.status_code == 401

    def test_creates_category_with_user_assigned(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/categories/",
            {"name": "Work", "color": "orange"},
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Work"
        assert data["color"] == "orange"
        assert "id" in data
        assert "created_at" in data
        cat = Category.objects.get(id=data["id"])
        assert cat.user_id == user.id

    def test_validates_color_choice(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/categories/",
            {"name": "Work", "color": "invalid"},
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestCategoryDetail:
    def test_returns_401_when_unauthenticated(self, api_client, user):
        cat = Category.objects.create(user=user, name="Work", color="orange")
        response = api_client.get(f"/api/categories/{cat.id}/")
        assert response.status_code == 401

    def test_returns_404_when_accessing_other_users_category(self, api_client, user, other_user):
        other_cat = Category.objects.create(user=other_user, name="OtherCat", color="orange")
        api_client.force_authenticate(user=user)
        response = api_client.get(f"/api/categories/{other_cat.id}/")
        assert response.status_code == 404

    def test_retrieve_own_category(self, api_client, user):
        cat = Category.objects.create(user=user, name="Work", color="teal")
        api_client.force_authenticate(user=user)
        response = api_client.get(f"/api/categories/{cat.id}/")
        assert response.status_code == 200
        assert response.json()["name"] == "Work"
        assert response.json()["color"] == "teal"

    def test_update_own_category(self, api_client, user):
        cat = Category.objects.create(user=user, name="Work", color="orange")
        api_client.force_authenticate(user=user)
        response = api_client.patch(
            f"/api/categories/{cat.id}/",
            {"name": "Personal"},
            format="json",
        )
        assert response.status_code == 200
        cat.refresh_from_db()
        assert cat.name == "Personal"

    def test_delete_own_category(self, api_client, user):
        cat = Category.objects.create(user=user, name="Work", color="orange")
        api_client.force_authenticate(user=user)
        response = api_client.delete(f"/api/categories/{cat.id}/")
        assert response.status_code == 204
        assert not Category.objects.filter(id=cat.id).exists()


@pytest.mark.django_db
class TestCategoryUniqueConstraint:
    def test_duplicate_name_case_insensitive_returns_400(self, api_client, user):
        Category.objects.create(user=user, name="Work", color="orange")
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/categories/",
            {"name": "work", "color": "yellow"},
            format="json",
        )
        assert response.status_code == 400
