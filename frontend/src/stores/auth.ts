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

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return !!user.value
  })

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true

    try {
      // Clear error only when we're about to make the request
      error.value = null

      // Login with custom cookie-based endpoint
      await api.post('/account/login/', credentials)

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

  const logout = async () => {
    try {
      // Call backend logout endpoint to blacklist token
      await api.post('/account/logout/')
    } catch (err) {
      console.error('Logout error:', err)
      // Continue with local logout even if backend call fails
    }

    // Clear user data
    user.value = null
    error.value = null

    // Note: Redirect will be handled by the component calling logout
  }

  const getCurrentUser = async () => {
    try {
      const response = await api.get('/auth/users/me/')
      user.value = response.data
      return user.value
    } catch (err) {
      console.error('Failed to get current user:', err)
      // If getting user fails, token might be invalid
      user.value = null
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
    try {
      await getCurrentUser()
      return !!user.value
    } catch (err) {
      console.error('Auth check failed:', err)
      user.value = null
      return false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    login,
    logout,
    getCurrentUser,
    register,
    checkAuthStatus,
    clearError,
  }
})
