<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div v-if="authStore.user" class="text-sm">Welcome, {{ authStore.user.email }}</div>
    <button
      @click="handleLogout"
      class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      Logout
    </button>
  </div>
</template>
