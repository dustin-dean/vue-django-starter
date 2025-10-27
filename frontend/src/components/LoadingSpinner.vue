<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  text: 'Loading...',
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <div
      :class="[
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
      ]"
    ></div>
    <span v-if="text" class="text-gray-600">{{ text }}</span>
  </div>
</template>
