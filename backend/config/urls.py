from django.contrib import admin
from django.urls import path, include, re_path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("djoser.urls")),
    path("api/auth/", include("djoser.urls.jwt")),
    path("api/account/", include("account.urls")),
]
