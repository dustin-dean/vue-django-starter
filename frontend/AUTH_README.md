# Vue.js Authentication System

This Vue.js app includes a complete authentication system integrated with Django REST Framework + JWT backend using **httpOnly cookie-based authentication** for enhanced security.

## Features

- ✅ JWT Token Authentication with httpOnly cookies
- ✅ Automatic token refresh via cookies
- ✅ Route protection with auth guards
- ✅ Pinia store for state management
- ✅ Axios interceptors for API calls
- ✅ Login/logout functionality with token blacklisting
- ✅ CSRF protection with SameSite=Strict cookies
- ✅ Secure cookies in production (Secure flag)
- ✅ No localStorage usage for tokens (XSS protection)

## Security Improvements

This authentication system uses **httpOnly cookie-based JWT tokens** instead of localStorage, providing several security benefits:

1. **XSS Protection**: Tokens stored in httpOnly cookies cannot be accessed by JavaScript, protecting against XSS attacks
2. **CSRF Protection**: SameSite=Strict cookies prevent CSRF attacks
3. **Secure Transport**: Cookies are marked as Secure in production, ensuring they're only sent over HTTPS
4. **Token Blacklisting**: Logout endpoint blacklists refresh tokens on the backend
5. **Automatic Cookie Management**: Browser handles cookie storage and transmission automatically

## Setup

1. **Environment Variables**
   Copy `.env.example` to `.env` and update the API URL if needed:

   ```
   VITE_API_URL=http://localhost:8000/api
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage

### Protected Routes

Add `meta: { requiresAuth: true }` to routes that require authentication:

```typescript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/pages/Dashboard.vue'),
  meta: { requiresAuth: true }
}
```

### Guest-Only Routes

Add `meta: { requiresGuest: true }` to routes that should only be accessible to unauthenticated users:

```typescript
{
  path: '/auth/login',
  name: 'Login',
  component: () => import('@/pages/auth/LoginView.vue'),
  meta: { requiresGuest: true }
}
```

### Using the Auth Store

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Check if user is authenticated
const isLoggedIn = authStore.isAuthenticated

// Get current user
const user = authStore.user

// Login
const login = async () => {
  const result = await authStore.login({
    username: 'user@example.com',
    password: 'password123',
  })

  if (result.success) {
    // Login successful
  } else {
    // Handle error: result.error
  }
}

// Logout
const logout = async () => {
  await authStore.logout()
  // Handle redirect in component
}
</script>
```

### Making API Calls

The axios instance is configured with automatic cookie handling:

```typescript
import api from '@/lib/api'

// All requests automatically include cookies (access token)
const userData = await api.get('/auth/users/me/')
const posts = await api.get('/posts/')
```

### Using the API Composable

For better error handling:

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'

const { makeRequest, isLoading, error } = useApi()

const fetchUserData = async () => {
  const userData = await makeRequest(() => api.get('/auth/users/me/'))
  if (userData) {
    // Handle success
  }
  // Error is automatically handled and stored in error.value
}
</script>

<template>
  <div>
    <button @click="fetchUserData" :disabled="isLoading">
      {{ isLoading ? 'Loading...' : 'Fetch Data' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>
```

## Backend Integration

The system expects these custom cookie-based endpoints:

- `POST /api/account/login/` - Login (sets httpOnly cookies)
- `POST /api/account/refresh/` - Refresh token (reads/writes cookies)
- `POST /api/account/logout/` - Logout (blacklists token, clears cookies)
- `GET /api/account/csrf/` - Get CSRF token
- `GET /api/auth/users/me/` - Get current user (requires authentication)
- `POST /api/auth/users/` - Register user

## Token Storage

Tokens are stored in **httpOnly cookies** (not accessible to JavaScript):

- `access_token` - JWT access token (httpOnly, Secure, SameSite=Strict)
- `refresh_token` - JWT refresh token (httpOnly, Secure, SameSite=Strict)

**Security Note**: Tokens are never stored in localStorage or sessionStorage, providing protection against XSS attacks.

## Auth Guard Behavior

- **Protected routes**: Redirects to login if not authenticated
- **Guest routes**: Redirects to home if already authenticated
- **Token refresh**: Automatically attempts token refresh on 401 errors via cookie-based endpoint
- **Session persistence**: Restores session from httpOnly cookies on app start

## Cookie-Based Authentication Flow

1. User submits login credentials
2. Backend validates credentials and creates JWT tokens
3. Backend sets httpOnly cookies with access and refresh tokens
4. Frontend stores user data in Pinia store (no token storage)
5. Browser automatically sends cookies with each request
6. Backend validates token from cookie
7. On logout, backend blacklists token and clears cookies

## CSRF Protection

The application uses CSRF tokens for cookie-based authentication:

- CSRF cookie is set by the backend on first request
- Frontend automatically includes CSRF token in request headers
- Backend validates CSRF token for state-changing requests

## Development vs Production

- **Development**: Cookies are not marked as Secure (works with HTTP)
- **Production**: Cookies are marked as Secure (requires HTTPS), SameSite=Strict

## Migration from localStorage

If you're migrating from the previous localStorage-based authentication:

1. Existing localStorage tokens are ignored
2. Users will need to log in again to get httpOnly cookies
3. Clear any old localStorage tokens: `localStorage.removeItem('access_token')` and `localStorage.removeItem('refresh_token')`
