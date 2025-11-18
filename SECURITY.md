# Security Documentation

## Authentication Security

This application implements production-ready security for authentication using **httpOnly cookie-based JWT tokens**.

## Security Features

### 1. HttpOnly Cookies for Token Storage

**Problem**: Storing JWT tokens in localStorage exposes them to XSS attacks, as malicious scripts can read and exfiltrate tokens.

**Solution**: Tokens are stored in httpOnly cookies, which cannot be accessed by JavaScript code.

```python
# Backend: Setting httpOnly cookies
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,  # Prevents JavaScript access
    secure=True,    # Only sent over HTTPS in production
    samesite='Strict',  # CSRF protection
)
```

### 2. CSRF Protection

**Configuration**:
- SameSite=Strict cookies prevent CSRF attacks
- CSRF tokens are used for state-changing requests
- CSRF token endpoint available at `/api/account/csrf/`

```python
# Django settings
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = "Strict"
CSRF_COOKIE_HTTPONLY = False  # CSRF token needs to be readable by JavaScript
```

### 3. Secure Cookie Transport

**Production Configuration**:
- Cookies marked with `Secure` flag in production (requires HTTPS)
- Automatically disabled in development for local testing

```python
# Django settings
"AUTH_COOKIE_SECURE": not DEBUG,  # Use secure cookies in production
```

### 4. Token Blacklisting

**Feature**: Logout endpoint blacklists refresh tokens on the backend, preventing reuse of compromised tokens.

```python
# Backend logout implementation
def post(self, request):
    refresh_token = request.COOKIES.get("refresh_token")
    if refresh_token:
        token = RefreshToken(refresh_token)
        token.blacklist()
```

### 5. Automatic Token Refresh

**Implementation**: Token refresh happens transparently via cookie-based mechanism without exposing tokens to JavaScript.

```typescript
// Frontend: Automatic refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      await axios.post('/account/refresh/', {}, { withCredentials: true })
      return api(originalRequest)
    }
  }
)
```

### 6. CORS Configuration

**Settings**:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:5173", ...]
CORS_ALLOW_CREDENTIALS = True
```

**Frontend**:
```typescript
const api = axios.create({
  withCredentials: true,  // Enable sending cookies
})
```

## Security Best Practices

### Environment Variables

**Critical**: Never commit sensitive environment variables to version control.

Required environment variables:
```env
SECRET_KEY=your-strong-secret-key-here
DEBUG=False  # In production
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Generate strong SECRET_KEY**:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Token Lifetimes

Configure appropriate token lifetimes:
```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),  # Short-lived
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),     # Long-lived
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
```

### HTTPS in Production

**Always use HTTPS in production**:
- Secure cookies are only sent over HTTPS
- Prevents token interception via man-in-the-middle attacks
- Configure SSL/TLS certificates on your server

### Trusted Origins

Configure trusted origins for CSRF protection:
```python
CSRF_TRUSTED_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]
```

## Threat Model

### Protected Against

1. **XSS (Cross-Site Scripting)**: 
   - ✅ Tokens in httpOnly cookies cannot be accessed by JavaScript
   - ✅ Even if attacker injects malicious script, tokens remain secure

2. **CSRF (Cross-Site Request Forgery)**:
   - ✅ SameSite=Strict cookies prevent CSRF attacks
   - ✅ CSRF tokens for additional protection

3. **Token Theft**:
   - ✅ Secure flag ensures tokens only sent over HTTPS
   - ✅ Token blacklisting on logout prevents reuse

4. **Session Hijacking**:
   - ✅ Short-lived access tokens limit exposure window
   - ✅ Refresh token rotation prevents long-term compromise

### Considerations

1. **Subdomain Attacks**: 
   - If an attacker compromises a subdomain, they may be able to access cookies
   - Mitigation: Use strict domain scoping for cookies

2. **Browser Security**:
   - HttpOnly cookies rely on browser security
   - Keep browsers updated

## Migration Guide

### From localStorage to httpOnly Cookies

If migrating from localStorage-based authentication:

1. **Backend Changes**:
   - Add cookie-based authentication classes
   - Update login/logout endpoints to set/clear cookies
   - Configure CSRF protection

2. **Frontend Changes**:
   - Remove localStorage token management
   - Add `withCredentials: true` to axios
   - Remove Authorization header injection

3. **User Impact**:
   - Users will need to log in again after deployment
   - Clear old localStorage tokens (optional cleanup)

## Security Checklist for Production

- [ ] Set `DEBUG=False` in production
- [ ] Use strong `SECRET_KEY` (never commit to version control)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set `ALLOWED_HOSTS` to your domain(s)
- [ ] Set `CORS_ALLOWED_ORIGINS` to your frontend domain(s)
- [ ] Configure `CSRF_TRUSTED_ORIGINS`
- [ ] Enable secure cookies (`SECURE` flag)
- [ ] Set up token blacklist database
- [ ] Configure appropriate token lifetimes
- [ ] Set up monitoring and logging
- [ ] Regular security updates for dependencies
- [ ] Implement rate limiting on authentication endpoints

## Testing Security

### Test httpOnly Cookies

```javascript
// In browser console - should return undefined
console.log(document.cookie)  // Should not show access_token or refresh_token
```

### Test CSRF Protection

```bash
# Should fail without CSRF token
curl -X POST https://your-api.com/api/account/logout/ \
  -H "Cookie: access_token=xxx" \
  -H "Content-Type: application/json"
```

### Test Secure Flag

```bash
# Should fail over HTTP in production
curl -X POST http://your-api.com/api/account/login/ \
  -d '{"username":"test","password":"test"}'
```

## Incident Response

If you suspect a security breach:

1. **Immediate Actions**:
   - Blacklist all refresh tokens in database
   - Force all users to re-login
   - Rotate SECRET_KEY (requires re-login for all users)

2. **Investigation**:
   - Check server logs for suspicious activity
   - Review access patterns
   - Check for unauthorized API calls

3. **Remediation**:
   - Apply security patches
   - Update dependencies
   - Review and improve security measures

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Cookie Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security)

## Reporting Security Issues

If you discover a security vulnerability, please email [security contact] with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** open public issues for security vulnerabilities.
