<script setup>
import { Sidebar, SidebarMenu, SidebarMenuItem } from './ui/sidebar'
import { LayoutDashboard, Package, Store, ShoppingCart } from 'lucide-vue-next'
</script>

<template>
  <Sidebar>
    <div class="flex h-16 items-center border-b border-sidebar-border px-6">
      <h1 class="text-lg font-semibold">پنل مدیریت قهوه</h1>
    </div>
    <SidebarMenu>
      <SidebarMenuItem to="/dashboard">
        <LayoutDashboard class="size-4" />
        <span>داشبورد</span>
      </SidebarMenuItem>
      <SidebarMenuItem to="/items">
        <Package class="size-4" />
        <span>آیتم‌ها</span>
      </SidebarMenuItem>
      <SidebarMenuItem to="/shop">
        <Store class="size-4" />
        <span>فروشگاه</span>
      </SidebarMenuItem>
      <SidebarMenuItem to="/orders">
        <ShoppingCart class="size-4" />
        <span>سفارش‌ها</span>
      </SidebarMenuItem>
    </SidebarMenu>
  </Sidebar>
</template>
