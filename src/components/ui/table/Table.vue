<script setup>
import { cn } from '@/lib/utils'
</script>

<template>
  <div :class="cn('relative w-full overflow-auto', $attrs.class)">
    <table :class="cn('w-full caption-bottom text-sm border-collapse', $attrs.class)">
      <slot />
    </table>
  </div>
</template>
