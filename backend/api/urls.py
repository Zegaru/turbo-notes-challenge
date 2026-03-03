from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

app_name = "api"

router = DefaultRouter()
router.register("categories", views.CategoryViewSet, basename="category")
router.register("notes", views.NoteViewSet, basename="note")

urlpatterns = [
    path("", include(router.urls)),
    path("health/", views.health),
    path("signup/", views.signup),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
