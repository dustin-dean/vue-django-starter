# Migration Guide: localStorage to httpOnly Cookies

This guide helps you migrate from the old localStorage-based authentication to the new cookie-based authentication system.

## Overview

**Old System**: JWT tokens stored in localStorage, sent via Authorization header  
**New System**: JWT tokens stored in httpOnly cookies, automatically sent by browser

## Why Migrate?

The new cookie-based system provides:
- ✅ **Better XSS Protection**: HttpOnly cookies can't be accessed by JavaScript
- ✅ **CSRF Protection**: SameSite=Strict cookies prevent CSRF attacks
- ✅ **Production Ready**: Meets modern security standards
- ✅ **Automatic Management**: Browser handles cookie storage and transmission

## Breaking Changes

### Backend API Changes

| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `POST /api/auth/jwt/create/` | `POST /api/account/login/` | Returns cookies instead of JSON tokens |
| `POST /api/auth/jwt/refresh/` | `POST /api/account/refresh/` | Reads/writes cookies instead of request body |
| N/A | `POST /api/account/logout/` | New endpoint for proper logout with token blacklisting |
| N/A | `GET /api/account/csrf/` | New endpoint to get CSRF token |

### Frontend Changes

1. **Axios Configuration**: Must include `withCredentials: true`
2. **Token Storage**: No more localStorage usage
3. **Authorization Header**: Removed (cookies sent automatically)
4. **Auth Store**: Simplified (no token management)

## Step-by-Step Migration

### For Backend Developers

If you're deploying this to an existing backend:

1. **Update Django Settings**:
   ```python
   # settings.py
   INSTALLED_APPS = [
       # ... existing apps
       'rest_framework_simplejwt.token_blacklist',  # Add this
   ]
   
   SIMPLE_JWT = {
       # ... existing settings
       "AUTH_COOKIE": "access_token",
       "AUTH_COOKIE_REFRESH": "refresh_token",
       "AUTH_COOKIE_SECURE": not DEBUG,
       "AUTH_COOKIE_SAMESITE": "Strict",
       "AUTH_COOKIE_HTTP_ONLY": True,
   }
   
   CSRF_COOKIE_SECURE = not DEBUG
   CSRF_COOKIE_SAMESITE = "Strict"
   ```

2. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Update URL Configuration**:
   ```python
   # urls.py
   urlpatterns = [
       path("api/account/", include("account.urls")),  # New cookie-based endpoints
       path("api/auth/", include("djoser.urls")),      # Keep for user management
   ]
   ```

4. **Deploy**: All users will need to log in again after deployment.

### For Frontend Developers

If you're updating an existing frontend:

1. **Update API Client** (`src/lib/api.ts`):
   ```typescript
   const api = axios.create({
       baseURL: import.meta.env.VITE_API_URL,
       withCredentials: true,  // Add this
   })
   
   // Remove Authorization header interceptor
   ```

2. **Update Auth Store** (`src/stores/auth.ts`):
   ```typescript
   // Remove all localStorage references
   // Remove accessToken and refreshToken state
   // Update login to use /api/account/login/
   // Update logout to call /api/account/logout/
   ```

3. **Update Auth Guard** (`src/router/middleware/authGuard.ts`):
   ```typescript
   // Remove localStorage.getItem('access_token') check
   // Rely on user state in auth store
   ```

4. **Clean Up Old Tokens** (Optional):
   ```typescript
   // In your app initialization
   localStorage.removeItem('access_token')
   localStorage.removeItem('refresh_token')
   ```

## Testing the Migration

### Manual Testing

1. **Login Flow**:
   ```bash
   curl -c cookies.txt -X POST http://localhost:8000/api/account/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"pass"}'
   ```

2. **Verify Cookies**:
   ```bash
   cat cookies.txt | grep -E "access_token|refresh_token"
   ```

3. **Test Protected Endpoint**:
   ```bash
   curl -b cookies.txt http://localhost:8000/api/account/protected/
   ```

### Automated Testing

Run the integration test script:
```bash
./test_auth_integration.sh
```

Run Django unit tests:
```bash
cd backend
python manage.py test account.test_authentication
```

## Deployment Checklist

- [ ] Backend changes deployed
- [ ] Database migrations run
- [ ] Frontend changes deployed
- [ ] Environment variables updated (if needed)
- [ ] HTTPS configured (required for Secure cookies in production)
- [ ] CORS_ALLOWED_ORIGINS configured correctly
- [ ] CSRF_TRUSTED_ORIGINS configured correctly
- [ ] Inform users they need to log in again

## Common Issues

### Issue: "CSRF token missing or incorrect"

**Solution**: Make sure CSRF_TRUSTED_ORIGINS includes your frontend domain:
```python
CSRF_TRUSTED_ORIGINS = ["https://your-frontend.com"]
```

### Issue: Cookies not being sent

**Solution**: Ensure:
1. `withCredentials: true` in axios config
2. `CORS_ALLOW_CREDENTIALS = True` in Django settings
3. Frontend and backend on same domain or CORS properly configured

### Issue: "Secure cookie" warning in browser console

**Solution**: This is normal in development. In production, ensure:
1. `DEBUG = False` in Django settings
2. HTTPS is enabled
3. `SECURE_SSL_REDIRECT = True` in production settings

### Issue: Users complain about being logged out

**Solution**: Expected behavior after migration. Users need to log in once with the new system.

## Rollback Plan

If you need to rollback:

1. **Backend**: Revert to previous deployment
2. **Frontend**: Revert to previous deployment
3. **Database**: Token blacklist tables can remain (won't cause issues)
4. Users can log in again with old system

## Security Considerations

### Production Requirements

✅ **Must Have**:
- HTTPS enabled (Secure cookies require it)
- Strong SECRET_KEY (never commit to version control)
- DEBUG=False in production
- Proper CORS configuration

⚠️ **Recommended**:
- Rate limiting on login endpoint
- Monitor for suspicious login patterns
- Regular security updates
- Backup and recovery procedures

### Environment Variables

Production `.env` example:
```env
SECRET_KEY=<generate-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://your-frontend.com
```

## Support

If you encounter issues:

1. Check the [SECURITY.md](SECURITY.md) documentation
2. Review the [AUTH_README.md](frontend/AUTH_README.md)
3. Run the integration tests: `./test_auth_integration.sh`
4. Check Django logs: `tail -f backend/django.log`
5. Open an issue with:
   - Steps to reproduce
   - Error messages
   - Browser console logs
   - Django server logs

## Additional Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Cookie Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security)
