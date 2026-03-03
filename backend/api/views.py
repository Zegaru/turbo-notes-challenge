from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import SignupSerializer


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
