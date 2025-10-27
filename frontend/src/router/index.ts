import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './middleware/authGuard'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomeView.vue'),
    meta: { requiresAuth: true }, // Protect home page
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginView.vue'),
    meta: { requiresGuest: true }, // Only allow unauthenticated users
  },
  // Add a dashboard route as an example of a protected route
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/HomeView.vue'), // Using HomeView as placeholder
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Apply auth guard to all routes
router.beforeEach(authGuard)

export default router
