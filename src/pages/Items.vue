<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
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
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/db";
import {
  Plus,
  Download,
  Search,
  Flame,
  Snowflake,
  Pencil,
  Trash2,
} from "lucide-vue-next";

const items = ref([]);
const searchQuery = ref("");
const isDrawerOpen = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const emptyItem = {
  name: "",
  price: "",
  temperature: "داغ",
  category: "نوشیدنی",
  coffeeBased: true,
  enabled: true,
};

const newItem = reactive({ ...emptyItem });

// Watch category changes - if breakfast, set temperature to hot
watch(
  () => newItem.category,
  (newCategory) => {
    if (newCategory === "صبحانه") {
      newItem.temperature = "داغ";
    }
  }
);

const formatPrice = (price) => {
  return new Intl.NumberFormat("fa-IR").format(price);
};

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const query = searchQuery.value.toLowerCase();
  return items.value.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.temperature.toLowerCase().includes(query)
  );
});

const resetForm = () => {
  Object.assign(newItem, { ...emptyItem });
};

const loadItems = async () => {
  const stored = await db.getItems();
  items.value = stored || [];
};

const openCreateDrawer = () => {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  isDrawerOpen.value = true;
};

const startEdit = (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  Object.assign(newItem, {
    name: item.name,
    price: item.price,
    temperature: item.temperature,
    category: item.category,
    coffeeBased: item.coffeeBased,
    enabled: item.enabled,
  });
  isDrawerOpen.value = true;
};

const deleteItem = (id) => {
  const item = items.value.find((i) => i.id === id);
  const label = item?.name ? `\"${item.name}\"` : "";
  const confirmed = window.confirm(`آیا از حذف ${label} مطمئن هستید؟`);
  if (!confirmed) return;

  db.items.delete(id);
  items.value = items.value.filter((item) => item.id !== id);
};

const submitItem = async () => {
  if (!newItem.name || !newItem.price) return;

  if (isEditing.value && editingId.value !== null) {
    const updated = await db.updateItem(editingId.value, {
      name: newItem.name,
      price: Number(newItem.price),
      temperature: newItem.temperature,
      category: newItem.category,
      coffeeBased: newItem.coffeeBased,
      enabled: newItem.enabled,
    });

    items.value = items.value.map((item) =>
      item.id === editingId.value ? updated : item
    );
  } else {
    const created = await db.addItem({
      name: newItem.name,
      price: Number(newItem.price),
      temperature: newItem.temperature,
      category: newItem.category,
      coffeeBased: newItem.coffeeBased,
      enabled: newItem.enabled,
    });

    items.value = [created, ...items.value];
  }

  isDrawerOpen.value = false;
  isEditing.value = false;
  editingId.value = null;
  resetForm();
};

onMounted(loadItems);
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header Section -->
    <div class="border-b bg-card px-6 py-6">
      <div class="mb-4">
        <h1 class="text-3xl font-bold mb-1">آیتم‌ها</h1>
        <p class="text-sm text-muted-foreground">
          مدیریت و مشاهده تمام آیتم‌های منو
        </p>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-2 flex-1 min-w-[200px]">
          <div class="relative flex-1 max-w-sm">
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

        <div class="flex items-center gap-2">
          <Button variant="outline" size="default">
            <Download class="size-4 ml-2" />
            وارد کردن
          </Button>
          <Button size="default" @click="openCreateDrawer">
            <Plus class="size-4 ml-2" />
            ایجاد آیتم جدید
          </Button>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="flex-1 overflow-auto px-6 py-6">
      <div class="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[300px]">نام</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>دما</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>بر پایه قهوه</TableHead>
              <TableHead class="text-center">وضعیت</TableHead>
              <TableHead class="w-[140px] text-center">اقدامات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in filteredItems"
              :key="item.id"
              class="hover:bg-muted/50"
              :class="{ 'opacity-60': !item.enabled }"
            >
              <TableCell class="font-medium">{{ item.name }}</TableCell>
              <TableCell>
                <span class="font-semibold">{{ formatPrice(item.price) }}</span>
                <span class="text-muted-foreground text-sm mr-1">تومان</span>
              </TableCell>
              <TableCell>
                <Badge :variant="item.temperature === 'داغ' ? 'hot' : 'cold'">
                  <Flame
                    v-if="item.temperature === 'داغ'"
                    class="size-3 ml-1"
                  />
                  <Snowflake v-else class="size-3 ml-1" />
                  {{ item.temperature }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  :variant="item.category === 'نوشیدنی' ? 'drink' : 'breakfast'"
                >
                  {{ item.category }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="item.coffeeBased ? 'coffee' : 'nonCoffee'">
                  {{ item.coffeeBased ? "بر پایه قهوه" : "بدون قهوه" }}
                </Badge>
              </TableCell>
              <TableCell class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <Switch v-model="item.enabled" />
                  <span class="text-xs text-muted-foreground">
                    {{ item.enabled ? "فعال" : "غیرفعال" }}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    class="size-8"
                    @click="startEdit(item)"
                  >
                    <Pencil class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8 text-destructive"
                    @click="deleteItem(item.id)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredItems.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">نتیجه‌ای یافت نشد</p>
      </div>
    </div>
  </div>

  <!-- Create Item Drawer -->
  <teleport to="body">
    <transition name="drawer">
      <div v-if="isDrawerOpen" class="fixed inset-0 z-50 flex flex-row-reverse">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="
            isDrawerOpen = false;
            isEditing = false;
          "
        ></div>

        <!-- Panel (from left side) -->
        <div
          class="relative h-full w-full max-w-md bg-card border-r border-border shadow-xl flex flex-col px-6 py-6 overflow-auto"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold">
                {{ isEditing ? "ویرایش آیتم" : "افزودن آیتم جدید" }}
              </h2>
              <p class="text-sm text-muted-foreground mt-1">
                {{
                  isEditing
                    ? "ویرایش اطلاعات آیتم انتخاب‌شده."
                    : "اطلاعات آیتم را وارد کنید تا به لیست اضافه شود."
                }}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="size-8"
              @click="
                isDrawerOpen = false;
                isEditing = false;
              "
            >
              ✕
            </Button>
          </div>

          <form class="space-y-4" @submit.prevent="submitItem">
            <div>
              <label class="block text-sm font-medium mb-1">نام آیتم</label>
              <Input v-model="newItem.name" placeholder="مثلاً: قهوه موکا" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">قیمت (تومان)</label>
              <Input
                v-model="newItem.price"
                type="number"
                min="0"
                placeholder="مثلاً: 45000"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">دما</label>
                <select
                  v-model="newItem.temperature"
                  :disabled="newItem.category === 'صبحانه'"
                  class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted"
                >
                  <option value="داغ">داغ</option>
                  <option value="سرد">سرد</option>
                </select>
                <p
                  v-if="newItem.category === 'صبحانه'"
                  class="text-xs text-muted-foreground mt-1"
                >
                  صبحانه‌ها همیشه داغ هستند
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">دسته‌بندی</label>
                <select
                  v-model="newItem.category"
                  class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="نوشیدنی">نوشیدنی</option>
                  <option value="صبحانه">صبحانه</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">بر پایه قهوه</label>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                  :class="
                    newItem.coffeeBased
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-border text-muted-foreground'
                  "
                  @click="newItem.coffeeBased = true"
                >
                  بر پایه قهوه
                </button>
                <button
                  type="button"
                  class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                  :class="
                    !newItem.coffeeBased
                      ? 'border-slate-500 bg-slate-50 text-slate-700'
                      : 'border-border text-muted-foreground'
                  "
                  @click="newItem.coffeeBased = false"
                >
                  بدون قهوه
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">وضعیت</label>
              <div class="flex items-center gap-3">
                <Switch v-model="newItem.enabled" />
                <span class="text-sm text-muted-foreground">
                  {{
                    newItem.enabled ? "فعال (قابل فروش)" : "غیرفعال (ناموجود)"
                  }}
                </span>
              </div>
            </div>

            <div
              class="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4"
            >
              <Button
                variant="outline"
                type="button"
                @click="
                  isDrawerOpen = false;
                  isEditing = false;
                "
              >
                انصراف
              </Button>
              <Button type="submit">
                {{ isEditing ? "ذخیره تغییرات" : "ثبت آیتم" }}
              </Button>
            </div>
          </form>
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
