import Dexie from "dexie";

class AppDatabase extends Dexie {
  constructor() {
    super("RevaqCoffeeDB");

    this.version(1).stores({
      items:
        "++id, name, price, temperature, category, coffeeBased, enabled, createdAt, updatedAt",
      orders: "++id, orderNumber, createdAt, updatedAt",
    });

    this.items = this.table("items");
    this.orders = this.table("orders");
  }

  async addItem(item) {
    const now = new Date().toISOString();
    const data = {
      ...item,
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    const id = await this.items.add(data);
    return { ...data, id };
  }

  async updateItem(id, updates) {
    const now = new Date().toISOString();
    await this.items.update(id, {
      ...updates,
      updatedAt: now,
    });
    return this.items.get(id);
  }

  async getItems() {
    return this.items.toArray();
  }

  async clearItems() {
    return this.items.clear();
  }

  async addOrder(order) {
    const now = new Date().toISOString();
    const data = {
      ...order,
      createdAt: order.createdAt || now,
      updatedAt: now,
    };
    const id = await this.orders.add(data);
    return { ...data, id };
  }

  async updateOrder(id, updates) {
    const now = new Date().toISOString();
    await this.orders.update(id, {
      ...updates,
      updatedAt: now,
    });
    return this.orders.get(id);
  }

  async getOrders() {
    return this.orders.orderBy("createdAt").reverse().toArray();
  }

  async clearOrders() {
    return this.orders.clear();
  }
}

export const db = new AppDatabase();
