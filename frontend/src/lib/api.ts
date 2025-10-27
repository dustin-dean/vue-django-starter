import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage directly to avoid circular dependency
    const token = localStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(
            '/auth/jwt/refresh/',
            {
              refresh: refreshToken,
            },
            {
              baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
            },
          )

          const newAccessToken = response.data.access
          localStorage.setItem('access_token', newAccessToken)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/auth/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
