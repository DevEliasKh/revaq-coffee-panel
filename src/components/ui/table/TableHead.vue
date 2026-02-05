<script setup>
import { cn } from '@/lib/utils'
</script>

<template>
  <th
    :class="cn(
      'h-12 px-4 text-right align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0',
      $attrs.class
    )"
  >
    <slot />
  </th>
</template>
