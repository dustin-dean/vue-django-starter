from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.conf import settings
from django.middleware.csrf import get_token


class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {"message": "This is a protected endpoint", "user": request.user.username}
        )


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that sets JWT tokens in httpOnly cookies
    """

    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200 and "access" in response.data:
            # Get cookie settings
            cookie_settings = {
                "httponly": True,
                "secure": settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", not settings.DEBUG),
                "samesite": settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Strict"),
                "max_age": int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
                "path": "/",
            }

            refresh_cookie_settings = {
                "httponly": True,
                "secure": settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", not settings.DEBUG),
                "samesite": settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Strict"),
                "max_age": int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                "path": "/",
            }

            # Set access token cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token"),
                value=response.data["access"],
                **cookie_settings,
            )

            # Set refresh token cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token"),
                value=response.data["refresh"],
                **refresh_cookie_settings,
            )

            # Remove tokens from response body for security
            response.data = {"detail": "Successfully logged in"}

        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view that reads refresh token from cookie
    and sets new access token in cookie
    """

    def post(self, request, *args, **kwargs):
        # Get refresh token from cookie
        refresh_token = request.COOKIES.get(
            settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token")
        )

        if refresh_token is None:
            return Response(
                {"detail": "Refresh token not found in cookies"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Create serializer with refresh token from cookie
        serializer = self.get_serializer(data={"refresh": refresh_token})
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        
        # Get the validated data
        validated_data = serializer.validated_data

        # Create response
        response = Response({"detail": "Token refreshed successfully"})

        # Set new access token in cookie
        cookie_settings = {
            "httponly": True,
            "secure": settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", not settings.DEBUG),
            "samesite": settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Strict"),
            "max_age": int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            "path": "/",
        }

        response.set_cookie(
            key=settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token"),
            value=validated_data["access"],
            **cookie_settings,
        )

        # If new refresh token is provided (rotation enabled), update it
        if "refresh" in validated_data:
            refresh_cookie_settings = {
                "httponly": True,
                "secure": settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", not settings.DEBUG),
                "samesite": settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Strict"),
                "max_age": int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                "path": "/",
            }

            response.set_cookie(
                key=settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token"),
                value=validated_data["refresh"],
                **refresh_cookie_settings,
            )

        return response


class LogoutView(APIView):
    """
    Logout view that blacklists the refresh token and clears cookies
    """

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Get refresh token from cookie
            refresh_token = request.COOKIES.get(
                settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token")
            )

            if refresh_token:
                # Blacklist the refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()

            response = Response(
                {"detail": "Successfully logged out"}, status=status.HTTP_200_OK
            )

            # Clear cookies
            response.delete_cookie(
                settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token"), path="/"
            )
            response.delete_cookie(
                settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token"),
                path="/",
            )

            return response

        except (TokenError, InvalidToken) as e:
            # Even if token is invalid, clear cookies
            response = Response(
                {"detail": "Logged out (token was invalid)"},
                status=status.HTTP_200_OK,
            )
            response.delete_cookie(
                settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token"), path="/"
            )
            response.delete_cookie(
                settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token"),
                path="/",
            )
            return response


class CSRFTokenView(APIView):
    """
    View to get CSRF token for cookie-based authentication
    """

    permission_classes = [AllowAny]

    def get(self, request):
        # This will set the CSRF cookie
        csrf_token = get_token(request)
        return Response({"detail": "CSRF cookie set"})
