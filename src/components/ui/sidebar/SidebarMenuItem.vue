<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { cn } from '@/lib/utils'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  class: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>

<template>
  <router-link
    :to="props.to"
    :class="cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors flex-row-reverse',
      isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      props.class
    )"
  >
    <slot />
  </router-link>
</template>
