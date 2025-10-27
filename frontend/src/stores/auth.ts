import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/lib/api'

export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  username?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem('access_token'))
  const refreshTokenValue = ref<string | null>(localStorage.getItem('refresh_token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!user.value
  })

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true

    try {
      // Clear error only when we're about to make the request
      error.value = null

      // Login with Djoser
      const response = await api.post('/auth/jwt/create/', credentials)
      const tokens: AuthTokens = response.data

      // Store tokens
      accessToken.value = tokens.access
      refreshTokenValue.value = tokens.refresh
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)

      // Get user info
      await getCurrentUser()

      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.response?.data?.detail || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    // Clear tokens and user data
    accessToken.value = null
    refreshTokenValue.value = null
    user.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // Note: Redirect will be handled by the component calling logout
  }

  const refreshToken = async () => {
    if (!refreshTokenValue.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await api.post('/auth/jwt/refresh/', {
        refresh: refreshTokenValue.value,
      })

      const newAccessToken = response.data.access
      accessToken.value = newAccessToken
      localStorage.setItem('access_token', newAccessToken)

      return newAccessToken
    } catch (err) {
      // Refresh failed, clear tokens
      accessToken.value = null
      refreshTokenValue.value = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      throw err
    }
  }

  const getCurrentUser = async () => {
    if (!accessToken.value) {
      return null
    }

    try {
      const response = await api.get('/auth/users/me/')
      user.value = response.data
      return user.value
    } catch (err) {
      console.error('Failed to get current user:', err)
      // If getting user fails, token might be invalid
      logout()
      return null
    }
  }

  const register = async (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      await api.post('/auth/users/', userData)
      return { success: true }
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err.response?.data?.detail || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const checkAuthStatus = async () => {
    if (!accessToken.value) {
      return false
    }

    try {
      await getCurrentUser()
      return true
    } catch (err) {
      console.error('Auth check failed:', err)
      logout()
      return false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    accessToken,
    refreshTokenValue,
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    login,
    logout,
    refreshToken,
    getCurrentUser,
    register,
    checkAuthStatus,
    clearError,
  }
})
