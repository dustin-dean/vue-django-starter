import { ref } from 'vue'
import api from '@/lib/api'

export function useApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const makeRequest = async <T>(request: () => Promise<T>): Promise<T | null> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await request()
      return result
    } catch (err: any) {
      error.value = err.response?.data?.detail || err.message || 'An error occurred'
      console.error('API request failed:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    isLoading,
    error,
    makeRequest,
    clearError,
    api,
  }
}
