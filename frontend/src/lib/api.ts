import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token using cookie-based refresh endpoint
        await axios.post(
          '/account/refresh/',
          {},
          {
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
            withCredentials: true,
          },
        )

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
