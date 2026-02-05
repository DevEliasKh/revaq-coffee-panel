<script setup>
import { ref, reactive, computed } from "vue";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/composables/useOrders";
import { db } from "@/lib/db";
import { Pencil, Trash2, Plus, Minus, Search } from "lucide-vue-next";

const { orders, deleteOrder, updateOrder } = useOrders();
const isEditModalOpen = ref(false);
const editingOrder = ref(null);
const editCart = ref([]);
const searchQuery = ref("");
const orderDiscount = ref(0);

const formatPrice = (price) => {
  return new Intl.NumberFormat("fa-IR").format(price ?? 0);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getFirstItem = (items) => {
  return items[0]?.name || "-";
};

const getOtherItems = (items) => {
  if (items.length <= 1) return "";
  return items
    .slice(1)
    .map((item) => `${item.name} (${item.quantity}x)`)
    .join(", ");
};

const handleDelete = (orderId, orderNumber) => {
  if (confirm(`آیا از حذف سفارش شماره ${orderNumber} مطمئن هستید؟`)) {
    deleteOrder(orderId);
  }
};

const openEditModal = (order) => {
  editingOrder.value = order;
  orderDiscount.value = order.discount ?? 0;
  // Convert order items to cart format
  editCart.value = order.items.map((item) => {
    const fullItem = order.items.find((i) => i.id === item.id);
    return {
      ...fullItem, // contains id, name, price
      cartId: Date.now() + Math.random(),
      quantity: item.quantity,
    };
  });
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingOrder.value = null;
  editCart.value = [];
  orderDiscount.value = 0;
};

const addItemToEditCart = (item) => {
  if (item.enabled === false) return;

  const existingItem = editCart.value.find(
    (cartItem) => cartItem.id === item.id
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    editCart.value.push({
      ...item,
      cartId: Date.now() + Math.random(),
      quantity: 1,
    });
  }
};

const removeFromEditCart = (cartId) => {
  editCart.value = editCart.value.filter((item) => item.cartId !== cartId);
};

const increaseEditQuantity = (cartId) => {
  const item = editCart.value.find((item) => item.cartId === cartId);
  if (item) {
    item.quantity += 1;
  }
};

const decreaseEditQuantity = (cartId) => {
  const item = editCart.value.find((item) => item.cartId === cartId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      removeFromEditCart(cartId);
    }
  }
};

const editCartTotalPrice = computed(() => {
  return editCart.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

const finalTotalPrice = computed(() => {
  const discount = Number(orderDiscount.value) || 0;
  return Math.max(0, editCartTotalPrice.value - discount);
});

const saveOrder = () => {
  if (editCart.value.length === 0) return;

  updateOrder(
    editingOrder.value.id,
    [...editCart.value],
    finalTotalPrice.value,
    Number(orderDiscount.value) || 0
  );
  closeEditModal();
  alert("سفارش با موفقیت به‌روزرسانی شد!");
};

const availableItems = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return editingOrder.value?.items.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
  );
});
</script>

<template>
  <div class="flex flex-col h-full px-6 py-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-1">سفارش‌ها</h1>
      <p class="text-sm text-muted-foreground">
        مشاهده و مدیریت تمام سفارش‌های ثبت شده
      </p>
    </div>

    <!-- Orders Table -->
    <div class="flex-1 overflow-auto">
      <div
        v-if="orders.length > 0"
        class="rounded-lg border border-border bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره سفارش</TableHead>
              <TableHead>آیتم‌ها</TableHead>
              <TableHead>تخفیف</TableHead>
              <TableHead>قیمت نهایی</TableHead>
              <TableHead>تاریخ ثبت</TableHead>
              <TableHead class="w-[100px] text-center">اقدامات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-muted/50"
            >
              <TableCell class="font-medium">
                #{{ order.orderNumber }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span>{{ getFirstItem(order.items) }}</span>
                  <span
                    v-if="order.items.length > 1"
                    class="text-xs text-muted-foreground cursor-help"
                    :title="getOtherItems(order.items)"
                  >
                    +{{ order.items.length - 1 }} مورد دیگر
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ formatPrice(order.discount || 0) }} تومان
              </TableCell>
              <TableCell class="font-semibold">
                {{ formatPrice(order.totalPrice) }} تومان
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ formatDate(order.createdAt) }}
              </TableCell>
              <TableCell>
                <div class="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8"
                    @click="openEditModal(order)"
                  >
                    <Pencil class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8 text-destructive hover:text-destructive"
                    @click="handleDelete(order.id, order.orderNumber)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <p class="text-muted-foreground mb-2">هنوز سفارشی ثبت نشده است.</p>
        <p class="text-xs text-muted-foreground">
          برای ثبت سفارش جدید، به بخش «فروشگاه» بروید.
        </p>
      </div>
    </div>
  </div>

  <!-- Edit Order Modal -->
  <teleport to="body">
    <transition name="drawer">
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-50 flex flex-row-reverse"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="closeEditModal"></div>

        <!-- Panel (from left side) -->
        <div
          class="relative h-full w-full max-w-2xl bg-card border-r border-border shadow-xl flex flex-col px-6 py-6 overflow-auto"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold">
                ویرایش سفارش #{{ editingOrder?.orderNumber }}
              </h2>
              <p class="text-sm text-muted-foreground mt-1">
                ویرایش آیتم‌های سفارش
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="size-8"
              @click="closeEditModal"
            >
              ✕
            </Button>
          </div>

          <div class="flex-1 overflow-auto mb-4">
            <!-- Search -->
            <div class="mb-4">
              <div class="relative">
                <Search
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="جستجو در آیتم‌ها..."
                  class="pr-9"
                />
              </div>
            </div>

            <!-- Available Items -->
            <div class="mb-6">
              <h3 class="text-sm font-semibold mb-3">افزودن آیتم</h3>
              <div class="grid gap-2 grid-cols-1 sm:grid-cols-2">
                <div
                  v-for="item in availableItems"
                  :key="item.id"
                  class="flex items-center justify-between p-2 rounded-md border border-border hover:bg-muted/50"
                  :class="{ 'opacity-60': item.enabled === false }"
                >
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ item.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatPrice(item.price) }} تومان
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="item.enabled === false"
                    @click="addItemToEditCart(item)"
                  >
                    <Plus class="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Current Cart Items -->
            <div>
              <h3 class="text-sm font-semibold mb-3">آیتم‌های سفارش</h3>
              <div
                v-if="editCart.length === 0"
                class="text-center py-8 text-muted-foreground"
              >
                <p class="text-sm">هیچ آیتمی در سفارش نیست</p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="item in editCart"
                  :key="item.cartId"
                  class="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                >
                  <div class="flex-1">
                    <h3 class="font-medium text-sm mb-1">{{ item.name }}</h3>
                    <p class="text-xs text-muted-foreground">
                      {{ formatPrice(item.price) }} تومان × {{ item.quantity }}
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    <div
                      class="flex items-center gap-2 border border-border rounded-md"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-8"
                        @click="decreaseEditQuantity(item.cartId)"
                      >
                        <Minus class="size-4" />
                      </Button>
                      <span
                        class="px-3 py-1 text-sm font-medium min-w-[2rem] text-center"
                      >
                        {{ item.quantity }}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-8"
                        @click="increaseEditQuantity(item.cartId)"
                      >
                        <Plus class="size-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="size-8 text-destructive hover:text-destructive"
                      @click="removeFromEditCart(item.cartId)"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total and Actions -->
          <div v-if="editCart.length > 0" class="border-t border-border pt-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">جمع اقلام:</span>
              <span class="text-base font-semibold">
                {{ formatPrice(editCartTotalPrice) }} تومان
              </span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted-foreground">تخفیف سفارش:</span>
              <div class="flex items-center gap-2">
                <Input
                  v-model.number="orderDiscount"
                  type="number"
                  min="0"
                  class="w-24 h-8 px-2 py-1 text-xs"
                />
                <span class="text-xs text-muted-foreground">تومان</span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold">مبلغ نهایی:</span>
              <span class="text-lg font-bold text-primary">
                {{ formatPrice(finalTotalPrice) }} تومان
              </span>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <Button variant="outline" class="flex-1" @click="closeEditModal">
                انصراف
              </Button>
              <Button class="flex-1" @click="saveOrder"> ذخیره تغییرات </Button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .relative,
.drawer-leave-active .relative {
  transition: transform 0.3s ease;
}

.drawer-enter-from {
  opacity: 0;
}

.drawer-enter-from .relative {
  transform: translateX(-100%);
}

.drawer-leave-to {
  opacity: 0;
}

.drawer-leave-to .relative {
  transform: translateX(-100%);
}
</style>
