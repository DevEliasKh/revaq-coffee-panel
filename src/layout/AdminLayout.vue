<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="flex h-screen w-full">
    <AppSidebar />
    <main class="flex-1 overflow-auto bg-background">
      <div class="flex flex-col h-full">
        <router-view />
      </div>
    </main>
  </div>
</template>
