from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Index, UniqueConstraint
from django.db.models.functions import Lower


def validate_note_image(file):
    if file.size > 5 * 1024 * 1024:
        raise ValidationError("File size must be <= 5MB")
    if (
        hasattr(file, "content_type")
        and file.content_type
        and not file.content_type.startswith("image/")
    ):
        raise ValidationError("File must be an image (image/*)")


CATEGORY_COLORS = [
    ("orange", "Orange"),
    ("yellow", "Yellow"),
    ("sage", "Sage"),
    ("teal", "Teal"),
]


class Category(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=80)
    color = models.CharField(
        max_length=20,
        choices=CATEGORY_COLORS,
        default="orange",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                F("user"),
                Lower("name"),
                name="unique_category_per_user_lower",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.user})"


class Note(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    category = models.ForeignKey(
        "Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes",
    )
    title = models.CharField(max_length=120, blank=True)
    content = models.TextField()
    pinned = models.BooleanField(default=False)
    draft = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            Index(
                fields=["user", "-pinned", "-updated_at"],
                name="note_user_pinned_updated_idx",
            )
        ]

    def __str__(self):
        return f"{self.title or '(no title)'} ({self.user})"


class NoteImage(models.Model):
    note = models.ForeignKey(
        "Note",
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(
        upload_to="notes/%Y/%m/%d",
        validators=[validate_note_image],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.note}"
