<script setup>
import { computed, ref, onMounted } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-vue-next";
import { useOrders } from "@/composables/useOrders";
import { db } from "@/lib/db";

const activeTab = ref("breakfast");
const items = ref([]);
const cart = ref([]);
const orderDiscount = ref(0);
const { addOrder } = useOrders();

const breakfastItems = computed(() =>
  items.value.filter((item) => item.category === "صبحانه")
);

const coffeeDrinkItems = computed(() =>
  items.value.filter(
    (item) => item.category === "نوشیدنی" && item.coffeeBased === true
  )
);

const nonCoffeeDrinkItems = computed(() =>
  items.value.filter(
    (item) => item.category === "نوشیدنی" && item.coffeeBased === false
  )
);

const currentItems = computed(() => {
  if (activeTab.value === "coffee") return coffeeDrinkItems.value;
  if (activeTab.value === "nonCoffee") return nonCoffeeDrinkItems.value;
  return breakfastItems.value;
});

const hotDrinks = computed(() => {
  if (activeTab.value === "breakfast") return [];
  return currentItems.value.filter((item) => item.temperature === "داغ");
});

const coldDrinks = computed(() => {
  if (activeTab.value === "breakfast") return [];
  return currentItems.value.filter((item) => item.temperature === "سرد");
});

const formatPrice = (price) =>
  new Intl.NumberFormat("fa-IR").format(price ?? 0);

const addToCart = (item) => {
  if (item.enabled === false) return;

  // Check if item already exists in cart
  const existingItem = cart.value.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    // If exists, increase quantity
    existingItem.quantity += 1;
  } else {
    // If not exists, add new item with quantity 1
    cart.value.push({ ...item, cartId: Date.now(), quantity: 1 });
  }
};

const removeFromCart = (cartId) => {
  cart.value = cart.value.filter((item) => item.cartId !== cartId);
};

const increaseQuantity = (cartId) => {
  const item = cart.value.find((item) => item.cartId === cartId);
  if (item) {
    item.quantity += 1;
  }
};

const decreaseQuantity = (cartId) => {
  const item = cart.value.find((item) => item.cartId === cartId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      removeFromCart(cartId);
    }
  }
};

const clearCart = () => {
  if (
    cart.value.length > 0 &&
    confirm("آیا از پاک کردن تمام آیتم‌های سبد خرید مطمئن هستید؟")
  ) {
    cart.value = [];
  }
};

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const totalItems = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0);
});

const finalTotalPrice = computed(() => {
  const discount = Number(orderDiscount.value) || 0;
  return Math.max(0, totalPrice.value - discount);
});

const loadItems = async () => {
  const stored = await db.getItems();
  items.value = stored || [];
};

const submitOrder = () => {
  if (cart.value.length === 0) return;

  addOrder(
    [...cart.value],
    finalTotalPrice.value,
    Number(orderDiscount.value) || 0
  );
  cart.value = [];
  orderDiscount.value = 0;
  alert("سفارش با موفقیت ثبت شد!");
};

onMounted(loadItems);
</script>

<template>
  <div class="flex h-full">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-auto px-6 py-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-1">فروشگاه</h1>
        <p class="text-sm text-muted-foreground">
          مشاهده منوی کامل و فیلتر آیتم‌ها بر اساس نوع سرویس.
        </p>
      </div>

      <!-- Tabs -->
      <div class="border-b border-border mb-4">
        <div class="flex gap-2">
          <button
            type="button"
            class="relative px-4 py-2 text-sm font-medium rounded-t-md"
            :class="
              activeTab === 'breakfast'
                ? 'bg-card text-foreground border border-b-transparent border-border'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'breakfast'"
          >
            صبحانه
          </button>

          <button
            type="button"
            class="relative px-4 py-2 text-sm font-medium rounded-t-md"
            :class="
              activeTab === 'coffee'
                ? 'bg-card text-foreground border border-b-transparent border-border'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'coffee'"
          >
            نوشیدنی‌های قهوه‌ای
          </button>

          <button
            type="button"
            class="relative px-4 py-2 text-sm font-medium rounded-t-md"
            :class="
              activeTab === 'nonCoffee'
                ? 'bg-card text-foreground border border-b-transparent border-border'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'nonCoffee'"
          >
            نوشیدنی‌های بدون قهوه
          </button>
        </div>
      </div>

      <!-- Items Grid -->
      <div class="flex-1 overflow-auto">
        <!-- Breakfast Items (No Split) -->
        <div
          v-if="activeTab === 'breakfast' && currentItems.length"
          class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div
            v-for="item in currentItems"
            :key="item.id"
            class="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="font-semibold text-base truncate">
                  {{ item.name }}
                </h2>
                <Badge
                  :variant="item.category === 'نوشیدنی' ? 'drink' : 'breakfast'"
                >
                  {{ item.category }}
                </Badge>
              </div>

              <div class="flex items-center justify-between mb-2 text-sm">
                <span class="text-muted-foreground">قیمت</span>
                <span class="font-semibold">
                  {{ formatPrice(item.price) }}
                  <span class="text-xs text-muted-foreground mr-1">تومان</span>
                </span>
              </div>

              <div
                class="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>
                  دما:
                  <span class="font-medium">
                    {{ item.temperature }}
                  </span>
                </span>
                <span>
                  قهوه:
                  <span class="font-medium">
                    {{ item.coffeeBased ? "بر پایه قهوه" : "بدون قهوه" }}
                  </span>
                </span>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <span
                v-if="item.enabled === false"
                class="text-xs text-destructive font-medium"
              >
                غیرفعال / ناموجود
              </span>
              <span v-else class="text-xs text-emerald-600 font-medium">
                موجود در منو
              </span>

              <Button
                variant="outline"
                size="sm"
                :disabled="item.enabled === false"
                :class="
                  item.enabled === false ? 'cursor-not-allowed opacity-60' : ''
                "
                @click="addToCart(item)"
              >
                افزودن به سفارش
              </Button>
            </div>
          </div>
        </div>

        <!-- Drinks Split by Temperature (Coffee & NonCoffee) -->
        <template v-else-if="activeTab !== 'breakfast'">
          <!-- Hot Drinks Section -->
          <div v-if="hotDrinks.length > 0" class="mb-8">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span class="text-destructive">🔥</span>
              نوشیدنی‌های داغ
            </h3>
            <div
              class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <div
                v-for="item in hotDrinks"
                :key="item.id"
                class="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h2 class="font-semibold text-base truncate">
                      {{ item.name }}
                    </h2>
                    <Badge
                      :variant="
                        item.category === 'نوشیدنی' ? 'drink' : 'breakfast'
                      "
                    >
                      {{ item.category }}
                    </Badge>
                  </div>

                  <div class="flex items-center justify-between mb-2 text-sm">
                    <span class="text-muted-foreground">قیمت</span>
                    <span class="font-semibold">
                      {{ formatPrice(item.price) }}
                      <span class="text-xs text-muted-foreground mr-1"
                        >تومان</span
                      >
                    </span>
                  </div>

                  <div
                    class="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <span>
                      دما:
                      <span class="font-medium">
                        {{ item.temperature }}
                      </span>
                    </span>
                    <span>
                      قهوه:
                      <span class="font-medium">
                        {{ item.coffeeBased ? "بر پایه قهوه" : "بدون قهوه" }}
                      </span>
                    </span>
                  </div>
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <span
                    v-if="item.enabled === false"
                    class="text-xs text-destructive font-medium"
                  >
                    غیرفعال / ناموجود
                  </span>
                  <span v-else class="text-xs text-emerald-600 font-medium">
                    موجود در منو
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="item.enabled === false"
                    :class="
                      item.enabled === false
                        ? 'cursor-not-allowed opacity-60'
                        : ''
                    "
                    @click="addToCart(item)"
                  >
                    افزودن به سفارش
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cold Drinks Section -->
          <div v-if="coldDrinks.length > 0">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span class="text-blue-600">❄️</span>
              نوشیدنی‌های سرد
            </h3>
            <div
              class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <div
                v-for="item in coldDrinks"
                :key="item.id"
                class="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h2 class="font-semibold text-base truncate">
                      {{ item.name }}
                    </h2>
                    <Badge
                      :variant="
                        item.category === 'نوشیدنی' ? 'drink' : 'breakfast'
                      "
                    >
                      {{ item.category }}
                    </Badge>
                  </div>

                  <div class="flex items-center justify-between mb-2 text-sm">
                    <span class="text-muted-foreground">قیمت</span>
                    <span class="font-semibold">
                      {{ formatPrice(item.price) }}
                      <span class="text-xs text-muted-foreground mr-1"
                        >تومان</span
                      >
                    </span>
                  </div>

                  <div
                    class="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <span>
                      دما:
                      <span class="font-medium">
                        {{ item.temperature }}
                      </span>
                    </span>
                    <span>
                      قهوه:
                      <span class="font-medium">
                        {{ item.coffeeBased ? "بر پایه قهوه" : "بدون قهوه" }}
                      </span>
                    </span>
                  </div>
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <span
                    v-if="item.enabled === false"
                    class="text-xs text-destructive font-medium"
                  >
                    غیرفعال / ناموجود
                  </span>
                  <span v-else class="text-xs text-emerald-600 font-medium">
                    موجود در منو
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="item.enabled === false"
                    :class="
                      item.enabled === false
                        ? 'cursor-not-allowed opacity-60'
                        : ''
                    "
                    @click="addToCart(item)"
                  >
                    افزودن به سفارش
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div
          v-if="currentItems.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <p class="text-muted-foreground mb-2">آیتمی برای این تب پیدا نشد.</p>
          <p class="text-xs text-muted-foreground">
            ابتدا از بخش «آیتم‌ها»، آیتم‌های جدید اضافه کنید یا فیلتر تب دیگری
            را امتحان کنید.
          </p>
        </div>
      </div>
    </div>

    <!-- Cart Sidebar (Always Visible) -->
    <div
      class="w-full max-w-md bg-card border-l border-border shadow-lg flex flex-col px-6 py-6 overflow-auto"
    >
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold">سبد خرید</h2>
          <p class="text-sm text-muted-foreground mt-1">
            {{ totalItems }} آیتم در سبد خرید
          </p>
        </div>
        <Button
          v-if="cart.length > 0"
          variant="ghost"
          size="sm"
          class="text-destructive hover:text-destructive"
          @click="clearCart"
        >
          پاک کردن همه
        </Button>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-auto mb-4">
        <div v-if="cart.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">سبد خرید شما خالی است</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in cart"
            :key="item.cartId"
            class="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-sm mb-1">{{ item.name }}</h3>
                <p class="text-xs text-muted-foreground">
                  {{ formatPrice(item.price) }} تومان × {{ item.quantity }}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="size-8 text-destructive hover:text-destructive"
                @click="removeFromCart(item.cartId)"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>

            <div class="flex items-center justify-between">
              <div
                class="flex items-center gap-2 border border-border rounded-md"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-8"
                  @click="decreaseQuantity(item.cartId)"
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
                  @click="increaseQuantity(item.cartId)"
                >
                  <Plus class="size-4" />
                </Button>
              </div>
              <span class="text-sm font-semibold">
                {{ formatPrice(item.price * item.quantity) }} تومان
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Price & Discount -->
      <div v-if="cart.length > 0" class="border-t border-border pt-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">جمع اقلام:</span>
          <span class="text-base font-semibold">
            {{ formatPrice(totalPrice) }} تومان
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

        <Button class="w-full mt-2" size="lg" @click="submitOrder">
          ثبت سفارش
        </Button>
      </div>
    </div>
  </div>
</template>
