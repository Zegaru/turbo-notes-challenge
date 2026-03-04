import difflib

from core.models import Category, Note, NoteImage
from core.models import validate_note_image as validate_image
from django.core.exceptions import ValidationError
from django.db.models import Q
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .ai import suggest_category
from .serializers import (
    CategorySerializer,
    NoteImageSerializer,
    NoteSerializer,
    SignupSerializer,
    SuggestCategoryRequestSerializer,
    SuggestCategoryResponseSerializer,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Health check endpoint for smoke tests."""
    return Response({"status": "ok"})


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    """Create a new user and return JWT tokens."""
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    )


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by("-created_at")


def _match_category(
    categories: list[tuple[int, str]], suggested_name: str | None
) -> tuple[int | None, str | None]:
    """Match suggested name to a category. Exact (case-insensitive) preferred, else fuzzy."""
    if not suggested_name or not categories:
        return None, None
    name_lower = suggested_name.strip().lower()
    if not name_lower:
        return None, None

    for cat_id, cat_name in categories:
        if cat_name.lower() == name_lower:
            return cat_id, cat_name

    names = [n for _, n in categories]
    matches = difflib.get_close_matches(name_lower, [n.lower() for n in names], n=1, cutoff=0.6)
    if matches:
        idx = next(i for i, (_, n) in enumerate(categories) if n.lower() == matches[0])
        cat_id, cat_name = categories[idx]
        return cat_id, cat_name
    return None, None


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user).order_by("-pinned", "-updated_at")
        if self.action == "list":
            qs = qs.filter(draft=False)
        params = self.request.query_params

        if category_id := params.get("category_id"):
            qs = qs.filter(category_id=category_id)
        if pinned := params.get("pinned"):
            if pinned.lower() == "true":
                qs = qs.filter(pinned=True)
            elif pinned.lower() == "false":
                qs = qs.filter(pinned=False)
        if q := params.get("q", "").strip():
            qs = qs.filter(Q(title__icontains=q) | Q(content__icontains=q))
        return qs

    @extend_schema(
        request=SuggestCategoryRequestSerializer,
        responses={200: SuggestCategoryResponseSerializer},
    )
    @action(detail=False, methods=["post"])
    def suggest_category(self, request):
        serializer = SuggestCategoryRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        title = serializer.validated_data.get("title", "") or ""
        content = serializer.validated_data.get("content", "") or ""

        categories = list(Category.objects.filter(user=request.user).values_list("id", "name"))
        names = [n for _, n in categories]
        result = suggest_category(categories=names, title=title, content=content)

        suggested_name = result.get("name")
        cat_id, matched_name = _match_category(categories, suggested_name)

        return Response(
            {
                "suggested_category_id": cat_id,
                "suggested_category_name": matched_name,
                "reason": result.get("reason", "AI unavailable"),
            }
        )

    @action(detail=True, methods=["post"], url_path="images")
    def upload_image(self, request, pk=None):
        note = self.get_object()
        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"detail": "Missing 'image' file"}, status=400)
        if note.images.count() >= 5:
            return Response({"detail": "Maximum 5 images per note"}, status=400)
        try:
            validate_image(image_file)
        except ValidationError as e:
            msg = e.messages[0] if getattr(e, "messages", None) else str(e)
            return Response({"detail": msg}, status=400)
        note_image = NoteImage(note=note, image=image_file)
        try:
            note_image.full_clean()
        except ValidationError as e:
            if e.message_dict:
                msgs = [
                    m
                    for ms in e.message_dict.values()
                    for m in (ms if isinstance(ms, list) else [ms])
                ]
            else:
                msgs = getattr(e, "messages", [])
            msg = str(msgs[0]) if msgs else "Invalid image"
            return Response({"detail": msg}, status=400)
        note_image.save()
        serializer = NoteImageSerializer(note_image, context={"request": request})
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["delete"], url_path="images/(?P<image_pk>[^/.]+)")
    def delete_image(self, request, pk=None, image_pk=None):
        note = self.get_object()
        note_image = note.images.filter(pk=image_pk).first()
        if not note_image:
            return Response({"detail": "Image not found"}, status=404)
        note_image.delete()
        return Response(status=204)
