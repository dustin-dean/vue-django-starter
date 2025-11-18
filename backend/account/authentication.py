from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings


class JWTCookieAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that reads tokens from httpOnly cookies
    instead of Authorization header.
    """

    def authenticate(self, request):
        # Try to get token from cookie first
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT.get("AUTH_COOKIE"))

        if raw_token is None:
            # Fallback to header-based authentication for backwards compatibility
            return super().authenticate(request)

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
