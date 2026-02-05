import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'
import Items from '@/pages/Items.vue'
import Shop from '@/pages/Shop.vue'
import Orders from '@/pages/Orders.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/items',
    name: 'Items',
    component: Items
  },
  {
    path: '/shop',
    name: 'Shop',
    component: Shop
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
