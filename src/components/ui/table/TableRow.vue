<script setup>
import { cn } from '@/lib/utils'
</script>

<template>
  <tr
    :class="cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer',
      $attrs.class
    )"
  >
    <slot />
  </tr>
</template>
