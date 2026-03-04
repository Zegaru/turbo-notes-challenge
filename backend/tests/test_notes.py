import pytest
from core.models import Category, Note, NoteImage
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

# Minimal valid 1x1 PNG (67 bytes)
MINIMAL_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00"
    b"\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


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


@pytest.fixture
def category(user):
    return Category.objects.create(user=user, name="Work", color="orange")


@pytest.fixture
def note(user, category):
    return Note.objects.create(
        user=user,
        category=category,
        title="Meeting notes",
        content="Discussed Q4 goals.",
        pinned=False,
        draft=False,
    )


@pytest.mark.django_db
class TestNoteList:
    def test_returns_401_when_unauthenticated(self, api_client):
        response = api_client.get("/api/notes/")
        assert response.status_code == 401

    def test_returns_only_own_notes_when_authenticated(
        self, api_client, user, other_user, category
    ):
        Note.objects.create(user=user, category=category, title="Mine", content="x", draft=False)
        other_cat = Category.objects.create(user=other_user, name="Other", color="yellow")
        Note.objects.create(
            user=other_user, category=other_cat, title="Theirs", content="y", draft=False
        )

        api_client.force_authenticate(user=user)
        response = api_client.get("/api/notes/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Mine"

    def test_excludes_drafts(self, api_client, user, category):
        Note.objects.create(user=user, category=category, title="Draft", content="x", draft=True)
        Note.objects.create(
            user=user, category=category, title="Published", content="y", draft=False
        )

        api_client.force_authenticate(user=user)
        response = api_client.get("/api/notes/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Published"

    def test_filter_by_category_id(self, api_client, user, category):
        cat2 = Category.objects.create(user=user, name="Personal", color="yellow")
        Note.objects.create(
            user=user, category=category, title="Work note", content="x", draft=False
        )
        Note.objects.create(
            user=user, category=cat2, title="Personal note", content="y", draft=False
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(f"/api/notes/?category_id={category.id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Work note"

    def test_filter_by_pinned(self, api_client, user, category):
        Note.objects.create(
            user=user, category=category, title="Pinned", content="x", pinned=True, draft=False
        )
        Note.objects.create(
            user=user, category=category, title="Unpinned", content="y", pinned=False, draft=False
        )

        api_client.force_authenticate(user=user)
        response = api_client.get("/api/notes/?pinned=true")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Pinned"

    def test_filter_by_search_q(self, api_client, user, category):
        Note.objects.create(
            user=user,
            category=category,
            title="Python tutorial",
            content="Learn Python",
            draft=False,
        )
        Note.objects.create(
            user=user,
            category=category,
            title="Meeting",
            content="Budget discussion",
            draft=False,
        )

        api_client.force_authenticate(user=user)
        response = api_client.get("/api/notes/?q=Python")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Python tutorial"


@pytest.mark.django_db
class TestNoteCreate:
    def test_returns_401_when_unauthenticated(self, api_client, category):
        response = api_client.post(
            "/api/notes/",
            {"title": "New", "content": "Body", "category": category.id},
            format="json",
        )
        assert response.status_code == 401

    def test_creates_note_with_user_assigned(self, api_client, user, category):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/notes/",
            {"title": "New note", "content": "Body text", "category": category.id},
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New note"
        assert data["content"] == "Body text"
        note = Note.objects.get(id=data["id"])
        assert note.user_id == user.id

    def test_rejects_other_users_category(self, api_client, user, other_user):
        other_cat = Category.objects.create(user=other_user, name="Other", color="orange")
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/notes/",
            {"title": "New", "content": "Body", "category": other_cat.id},
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestNoteDetail:
    def test_returns_401_when_unauthenticated(self, api_client, note):
        response = api_client.get(f"/api/notes/{note.id}/")
        assert response.status_code == 401

    def test_returns_404_when_accessing_other_users_note(
        self, api_client, user, other_user, category
    ):
        other_cat = Category.objects.create(user=other_user, name="Other", color="orange")
        other_note = Note.objects.create(
            user=other_user, category=other_cat, title="Theirs", content="x", draft=False
        )
        api_client.force_authenticate(user=user)
        response = api_client.get(f"/api/notes/{other_note.id}/")
        assert response.status_code == 404

    def test_retrieve_own_note(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        response = api_client.get(f"/api/notes/{note.id}/")
        assert response.status_code == 200
        assert response.json()["title"] == "Meeting notes"

    def test_update_own_note(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        response = api_client.patch(
            f"/api/notes/{note.id}/",
            {"title": "Updated title"},
            format="json",
        )
        assert response.status_code == 200
        note.refresh_from_db()
        assert note.title == "Updated title"

    def test_delete_own_note(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        response = api_client.delete(f"/api/notes/{note.id}/")
        assert response.status_code == 204
        assert not Note.objects.filter(id=note.id).exists()


@pytest.mark.django_db
class TestNoteSuggestCategory:
    def test_returns_401_when_unauthenticated(self, api_client):
        response = api_client.post(
            "/api/notes/suggest_category/",
            {"title": "Meeting", "content": "Notes"},
            format="json",
        )
        assert response.status_code == 401

    def test_requires_title_or_content_returns_400(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/notes/suggest_category/",
            {"title": "", "content": ""},
            format="json",
        )
        assert response.status_code == 400

    def test_returns_suggestion_with_exact_match(self, api_client, user, category):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/notes/suggest_category/",
            {"title": "Meeting notes", "content": "Discussed Q4 goals."},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "suggested_category_id" in data
        assert "suggested_category_name" in data
        assert "reason" in data
        assert data["suggested_category_id"] == category.id
        assert data["suggested_category_name"] == "Work"

    def test_returns_null_when_no_categories(self, api_client, user):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/notes/suggest_category/",
            {"title": "Random note", "content": "Some text"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["suggested_category_id"] is None
        assert data["suggested_category_name"] is None
        assert "reason" in data


@pytest.mark.django_db
class TestNoteUploadImage:
    def test_returns_401_when_unauthenticated(self, api_client, note):
        image = SimpleUploadedFile("test.png", MINIMAL_PNG, content_type="image/png")
        response = api_client.post(
            f"/api/notes/{note.id}/images/",
            {"image": image},
            format="multipart",
        )
        assert response.status_code == 401

    def test_missing_image_returns_400(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        response = api_client.post(
            f"/api/notes/{note.id}/images/",
            {},
            format="multipart",
        )
        assert response.status_code == 400
        assert "detail" in response.json()

    def test_max_5_images_returns_400(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        for _ in range(5):
            image = SimpleUploadedFile("test.png", MINIMAL_PNG, content_type="image/png")
            api_client.post(
                f"/api/notes/{note.id}/images/",
                {"image": image},
                format="multipart",
            )
        image = SimpleUploadedFile("test6.png", MINIMAL_PNG, content_type="image/png")
        response = api_client.post(
            f"/api/notes/{note.id}/images/",
            {"image": image},
            format="multipart",
        )
        assert response.status_code == 400
        assert "Maximum 5" in response.json().get("detail", "")

    def test_valid_upload_returns_201(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        image = SimpleUploadedFile("test.png", MINIMAL_PNG, content_type="image/png")
        response = api_client.post(
            f"/api/notes/{note.id}/images/",
            {"image": image},
            format="multipart",
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert "url" in data
        assert "created_at" in data
        assert NoteImage.objects.filter(note=note).count() == 1

    def test_rejects_file_over_5mb(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        large_file = SimpleUploadedFile(
            "large.png",
            b"x" * (5 * 1024 * 1024 + 1),
            content_type="image/png",
        )
        response = api_client.post(
            f"/api/notes/{note.id}/images/",
            {"image": large_file},
            format="multipart",
        )
        assert response.status_code == 400

    def test_rejects_non_image_content_type(self, api_client, user, note):
        api_client.force_authenticate(user=user)
        non_image = SimpleUploadedFile(
            "file.txt", b"not an image", content_type="application/octet-stream"
        )
        response = api_client.post(
            f"/api/notes/{note.id}/images/",
            {"image": non_image},
            format="multipart",
        )
        assert response.status_code == 400
