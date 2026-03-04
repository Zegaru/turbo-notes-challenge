from core.models import Category, Note, NoteImage
from django.contrib.auth.models import User
from rest_framework import serializers


def get_request_user(serializer):
    """Get request.user from serializer context. Raises if missing."""
    request = serializer.context.get("request")
    if not request or not request.user.is_authenticated:
        raise serializers.ValidationError("Authentication required.")
    return request.user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        user = get_request_user(self)
        qs = Category.objects.filter(user=user, name__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return value

    def create(self, validated_data):
        validated_data["user"] = get_request_user(self)
        return super().create(validated_data)


class NoteImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = NoteImage
        fields = ["id", "url", "created_at"]
        read_only_fields = ["id", "url", "created_at"]

    def get_url(self, obj):
        url = obj.image.url
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)
        return url


class NoteSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_color = serializers.SerializerMethodField()
    images = NoteImageSerializer(many=True, read_only=True)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_category_color(self, obj):
        return obj.category.color if obj.category else None

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "pinned",
            "draft",
            "category",
            "category_name",
            "category_color",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "category_name",
            "category_color",
            "images",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "title": {"allow_blank": True, "required": False},
            "content": {"allow_blank": True, "required": False},
        }

    def validate_category(self, value):
        if value is None:
            return value
        user = get_request_user(self)
        if value.user_id != user.id:
            raise serializers.ValidationError("Category does not belong to you.")
        return value

    def create(self, validated_data):
        validated_data["user"] = get_request_user(self)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        get_request_user(self)
        return super().update(instance, validated_data)


class SuggestCategoryRequestSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, default="")
    content = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, data):
        if not data.get("title", "").strip() and not data.get("content", "").strip():
            raise serializers.ValidationError("At least one of title or content is required.")
        return data


class SuggestCategoryResponseSerializer(serializers.Serializer):
    suggested_category_id = serializers.IntegerField(allow_null=True)
    suggested_category_name = serializers.CharField(allow_null=True)
    reason = serializers.CharField()


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )
        return user
