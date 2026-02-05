<script setup>
import { computed, provide } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  side: {
    type: String,
    default: 'left'
  },
  variant: {
    type: String,
    default: 'sidebar'
  },
  collapsible: {
    type: String,
    default: 'offcanvas'
  },
  class: {
    type: String,
    default: ''
  }
})

const isMobile = computed(() => props.collapsible === 'offcanvas')

provide('sidebar', {
  side: props.side,
  variant: props.variant,
  collapsible: props.collapsible,
  isMobile
})
</script>

<template>
  <aside
    :class="cn(
      'flex h-screen w-64 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground',
      props.class
    )"
  >
    <slot />
  </aside>
</template>
