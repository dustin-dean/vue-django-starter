# Vue.js Authentication System

This Vue.js app includes a complete authentication system integrated with Django REST Framework + Djoser backend.

## Features

- ✅ JWT Token Authentication
- ✅ Automatic token refresh
- ✅ Route protection with auth guards
- ✅ Pinia store for state management
- ✅ Axios interceptors for API calls
- ✅ Login/logout functionality
- ✅ User session persistence

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
    email: 'user@example.com',
    password: 'password123',
  })

  if (result.success) {
    // Login successful
  } else {
    // Handle error: result.error
  }
}

// Logout
const logout = () => {
  authStore.logout()
  // Handle redirect in component
}
</script>
```

### Making API Calls

The axios instance is configured with automatic token handling:

```typescript
import api from '@/lib/api'

// All requests automatically include Bearer token
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

The system expects these Djoser endpoints:

- `POST /auth/jwt/create/` - Login
- `POST /auth/jwt/refresh/` - Refresh token
- `GET /auth/users/me/` - Get current user
- `POST /auth/users/` - Register user

## Token Storage

Tokens are stored in localStorage:

- `access_token` - JWT access token
- `refresh_token` - JWT refresh token

## Auth Guard Behavior

- **Protected routes**: Redirects to login if not authenticated
- **Guest routes**: Redirects to home if already authenticated
- **Token refresh**: Automatically attempts token refresh on 401 errors
- **Session persistence**: Restores session from localStorage on app start
