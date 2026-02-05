<script setup>
import { cn } from '@/lib/utils'
</script>

<template>
  <nav :class="cn('flex flex-col gap-1 p-2', $attrs.class)">
    <slot />
  </nav>
</template>
