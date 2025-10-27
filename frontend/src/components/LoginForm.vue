<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Form data
const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const localError = ref<string | null>(null)

// Clear any previous errors when component mounts
onMounted(() => {
  authStore.clearError()
  localError.value = null
})

const handleSubmit = async (e: Event) => {
  e.preventDefault()

  if (isSubmitting.value) return

  isSubmitting.value = true
  // Clear local error when starting new attempt
  localError.value = null

  const result = await authStore.login({
    username: username.value,
    password: password.value,
  })

  if (result.success) {
    // Redirect to intended page or home
    const redirectTo = (route.query.redirect as string) || '/'
    router.push(redirectTo)
  } else {
    // Store the error locally so it persists
    localError.value = result.error || authStore.error || 'Login failed'
  }

  isSubmitting.value = false
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl"> Welcome back </CardTitle>
        <CardDescription> Login with your Apple or Google account </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handleSubmit">
          <div class="grid gap-6">
            <!-- Show error message if there is one -->
            <div
              v-if="localError || authStore.error"
              class="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
            >
              {{ localError || authStore.error }}
            </div>

            <div class="grid gap-3">
              <Label for="username">Username</Label>
              <Input
                id="username"
                v-model="username"
                type="text"
                placeholder="jdoe1"
                required
                :disabled="isSubmitting"
              />
            </div>
            <div class="grid gap-3">
              <div class="flex items-center">
                <Label for="password">Password</Label>
                <a href="#" class="ml-auto text-sm underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                required
                :disabled="isSubmitting"
              />
            </div>
            <Button type="submit" class="w-full" :disabled="isSubmitting || authStore.isLoading">
              <span v-if="isSubmitting || authStore.isLoading">Logging in...</span>
              <span v-else>Login</span>
            </Button>
          </div>
          <div class="text-center text-sm">
            Don't have an account?
            <a href="#" class="underline underline-offset-4"> Sign up </a>
          </div>
        </form>
      </CardContent>
    </Card>
    <div
      class="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4"
    >
      By clicking continue, you agree to our <a href="#">Terms of Service</a> and
      <a href="#">Privacy Policy</a>.
    </div>
  </div>
</template>
