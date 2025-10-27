import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Check if route requires guest (unauthenticated user)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth) {
    // Route requires authentication
    if (!authStore.isAuthenticated) {
      // Check if we have tokens in localStorage and try to restore session
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        try {
          const isValid = await authStore.checkAuthStatus()
          if (isValid) {
            next()
            return
          }
        } catch (error) {
          console.error('Auth check failed:', error)
        }
      }

      // Not authenticated, redirect to login
      next({
        name: 'Login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // User is authenticated, allow access
    next()
  } else if (requiresGuest) {
    // Route requires guest (like login page)
    if (authStore.isAuthenticated) {
      // Already authenticated, redirect to home
      next({ name: 'Home' })
      return
    }

    // User is not authenticated, allow access
    next()
  } else {
    // Route doesn't require special authentication, allow access
    next()
  }
}
