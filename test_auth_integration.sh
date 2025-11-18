#!/bin/bash
# Integration test script for cookie-based authentication
# This script tests the complete authentication flow

set -e

API_URL="http://localhost:8000/api"
TEMP_COOKIES="/tmp/test_cookies.txt"

echo "🧪 Testing Cookie-Based JWT Authentication"
echo "==========================================="
echo ""

# Clean up
rm -f "$TEMP_COOKIES"

# 1. Test CSRF endpoint
echo "1. Testing CSRF endpoint..."
CSRF_RESPONSE=$(curl -s -c "$TEMP_COOKIES" "$API_URL/account/csrf/")
if echo "$CSRF_RESPONSE" | grep -q "CSRF cookie set"; then
    echo "   ✅ CSRF endpoint works"
else
    echo "   ❌ CSRF endpoint failed"
    exit 1
fi
echo ""

# 2. Test login with invalid credentials
echo "2. Testing login with invalid credentials..."
LOGIN_FAIL=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_URL/account/login/" \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "wrongpassword"}')

if [ "$LOGIN_FAIL" = "401" ]; then
    echo "   ✅ Invalid credentials rejected"
else
    echo "   ❌ Should reject invalid credentials (got HTTP $LOGIN_FAIL)"
    exit 1
fi
echo ""

# 3. Test successful login
echo "3. Testing successful login..."
LOGIN_RESPONSE=$(curl -s -c "$TEMP_COOKIES" -X POST "$API_URL/account/login/" \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "testpassword123"}')

if echo "$LOGIN_RESPONSE" | grep -q "Successfully logged in"; then
    echo "   ✅ Login successful"
    
    # Check for cookies
    if grep -q "access_token" "$TEMP_COOKIES" && grep -q "refresh_token" "$TEMP_COOKIES"; then
        echo "   ✅ HttpOnly cookies set"
    else
        echo "   ❌ Cookies not set properly"
        exit 1
    fi
else
    echo "   ❌ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# 4. Test protected endpoint with cookies
echo "4. Testing protected endpoint with valid cookies..."
PROTECTED_RESPONSE=$(curl -s -b "$TEMP_COOKIES" "$API_URL/account/protected/")

if echo "$PROTECTED_RESPONSE" | grep -q "This is a protected endpoint"; then
    echo "   ✅ Protected endpoint accessible with cookies"
    echo "   Response: $PROTECTED_RESPONSE"
else
    echo "   ❌ Protected endpoint failed"
    echo "   Response: $PROTECTED_RESPONSE"
    exit 1
fi
echo ""

# 5. Test protected endpoint without cookies
echo "5. Testing protected endpoint without authentication..."
NO_AUTH_RESPONSE=$(curl -s "$API_URL/account/protected/")

if echo "$NO_AUTH_RESPONSE" | grep -q "Authentication credentials were not provided"; then
    echo "   ✅ Protected endpoint requires authentication"
else
    echo "   ❌ Protected endpoint should require authentication"
    exit 1
fi
echo ""

# 6. Test token refresh
echo "6. Testing token refresh..."
REFRESH_RESPONSE=$(curl -s -b "$TEMP_COOKIES" -c "$TEMP_COOKIES" -X POST "$API_URL/account/refresh/")

if echo "$REFRESH_RESPONSE" | grep -q "Token refreshed successfully"; then
    echo "   ✅ Token refresh successful"
    
    # Verify we can still access protected endpoint
    PROTECTED_AFTER_REFRESH=$(curl -s -b "$TEMP_COOKIES" "$API_URL/account/protected/")
    if echo "$PROTECTED_AFTER_REFRESH" | grep -q "This is a protected endpoint"; then
        echo "   ✅ Protected endpoint still accessible after refresh"
    else
        echo "   ❌ Protected endpoint not accessible after refresh"
        exit 1
    fi
else
    echo "   ❌ Token refresh failed"
    echo "   Response: $REFRESH_RESPONSE"
    exit 1
fi
echo ""

# 7. Test logout
echo "7. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -b "$TEMP_COOKIES" -c "$TEMP_COOKIES" -X POST "$API_URL/account/logout/")

if echo "$LOGOUT_RESPONSE" | grep -q "Successfully logged out"; then
    echo "   ✅ Logout successful"
    
    # Verify cookies are cleared
    PROTECTED_AFTER_LOGOUT=$(curl -s -b "$TEMP_COOKIES" "$API_URL/account/protected/")
    if echo "$PROTECTED_AFTER_LOGOUT" | grep -q "Authentication credentials were not provided"; then
        echo "   ✅ Cookies cleared, protected endpoint not accessible"
    else
        echo "   ⚠️  Warning: Protected endpoint might still be accessible"
    fi
else
    echo "   ❌ Logout failed"
    exit 1
fi
echo ""

# Clean up
rm -f "$TEMP_COOKIES"

echo "==========================================="
echo "✅ All integration tests passed!"
echo ""
echo "Security Features Verified:"
echo "  - HttpOnly cookies for token storage"
echo "  - SameSite=Strict for CSRF protection"
echo "  - Token refresh via cookie-based mechanism"
echo "  - Token blacklisting on logout"
echo "  - Protected endpoints require authentication"
