<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">My App</h1>
          </div>
          <LogoutButton />
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to the Dashboard!</h2>
            <p class="text-gray-600 mb-6">You are successfully authenticated.</p>

            <div v-if="authStore.user" class="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
              <h3 class="text-lg font-medium text-gray-900 mb-4">User Information</h3>
              <div class="space-y-2 text-left">
                <p><span class="font-medium">Email:</span> {{ authStore.user.email }}</p>
                <p><span class="font-medium">ID:</span> {{ authStore.user.id }}</p>
                <p v-if="authStore.user.first_name">
                  <span class="font-medium">First Name:</span> {{ authStore.user.first_name }}
                </p>
                <p v-if="authStore.user.last_name">
                  <span class="font-medium">Last Name:</span> {{ authStore.user.last_name }}
                </p>
              </div>
            </div>

            <div class="mt-6">
              <Button @click="testApiCall" :disabled="isTestingApi" class="mr-4">
                {{ isTestingApi ? 'Testing...' : 'Test API Call' }}
              </Button>
              <Button variant="outline" @click="refreshUserData" :disabled="isRefreshing">
                {{ isRefreshing ? 'Refreshing...' : 'Refresh User Data' }}
              </Button>
            </div>

            <div
              v-if="apiTestResult"
              class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md"
            >
              <p class="text-green-800">{{ apiTestResult }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/LogoutButton.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'

const authStore = useAuthStore()
const isTestingApi = ref(false)
const isRefreshing = ref(false)
const apiTestResult = ref('')

onMounted(async () => {
  // Ensure user data is loaded
  if (!authStore.user) {
    await authStore.getCurrentUser()
  }
})

const testApiCall = async () => {
  isTestingApi.value = true
  apiTestResult.value = ''

  try {
    const response = await api.get('/auth/users/me/')
    apiTestResult.value = 'API call successful! User data retrieved.'
  } catch (error) {
    apiTestResult.value = 'API call failed. Check console for details.'
    console.error('API test failed:', error)
  } finally {
    isTestingApi.value = false
  }
}

const refreshUserData = async () => {
  isRefreshing.value = true

  try {
    await authStore.getCurrentUser()
    apiTestResult.value = 'User data refreshed successfully!'
  } catch (error) {
    apiTestResult.value = 'Failed to refresh user data.'
    console.error('Refresh failed:', error)
  } finally {
    isRefreshing.value = false
  }
}
</script>
<style scoped></style>
