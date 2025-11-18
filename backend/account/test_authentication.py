from django.test import TestCase, Client
from django.urls import reverse
from account.models import User


class CookieAuthenticationTestCase(TestCase):
    """Tests for cookie-based JWT authentication"""

    def setUp(self):
        """Set up test client and user"""
        self.client = Client()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpassword123"
        )

    def test_login_sets_httponly_cookies(self):
        """Test that login endpoint sets httpOnly cookies"""
        response = self.client.post(
            reverse("login"),
            {"username": "testuser", "password": "testpassword123"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

        # Check httpOnly flag
        access_cookie = response.cookies["access_token"]
        self.assertTrue(access_cookie["httponly"])
        self.assertEqual(access_cookie["samesite"], "Strict")

    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post(
            reverse("login"),
            {"username": "testuser", "password": "wrongpassword"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertNotIn("access_token", response.cookies)

    def test_protected_endpoint_requires_authentication(self):
        """Test that protected endpoint requires authentication"""
        response = self.client.get(reverse("protected"))

        self.assertEqual(response.status_code, 401)

    def test_protected_endpoint_with_valid_cookie(self):
        """Test that protected endpoint works with valid cookie"""
        # Login first
        login_response = self.client.post(
            reverse("login"),
            {"username": "testuser", "password": "testpassword123"},
            content_type="application/json",
        )

        # Access protected endpoint
        response = self.client.get(reverse("protected"))

        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
        self.assertEqual(response.json()["user"], "testuser")

    def test_logout_clears_cookies(self):
        """Test that logout endpoint clears cookies"""
        # Login first
        self.client.post(
            reverse("login"),
            {"username": "testuser", "password": "testpassword123"},
            content_type="application/json",
        )

        # Logout
        response = self.client.post(reverse("logout"))

        self.assertEqual(response.status_code, 200)

        # Check that cookies are cleared (max_age=0)
        access_cookie = response.cookies.get("access_token")
        refresh_cookie = response.cookies.get("refresh_token")

        self.assertEqual(access_cookie["max-age"], 0)
        self.assertEqual(refresh_cookie["max-age"], 0)

    def test_token_refresh(self):
        """Test token refresh endpoint"""
        # Login first
        login_response = self.client.post(
            reverse("login"),
            {"username": "testuser", "password": "testpassword123"},
            content_type="application/json",
        )

        # Refresh token
        response = self.client.post(reverse("token-refresh"))

        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.cookies)

    def test_csrf_endpoint(self):
        """Test CSRF token endpoint"""
        response = self.client.get(reverse("csrf-token"))

        self.assertEqual(response.status_code, 200)
        self.assertIn("csrftoken", response.cookies)
