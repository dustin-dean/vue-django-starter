from django.urls import path
from .views import (
    ProtectedView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    CSRFTokenView,
)

urlpatterns = [
    path("protected/", ProtectedView.as_view(), name="protected"),
    path("login/", CookieTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("csrf/", CSRFTokenView.as_view(), name="csrf-token"),
]
