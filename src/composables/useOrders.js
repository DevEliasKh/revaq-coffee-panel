import { ref, onMounted } from "vue";
import { db } from "../lib/db";

const orders = ref([]);

export const useOrders = () => {
  const loadOrders = async () => {
    const storedOrders = await db.getOrders();
    orders.value = storedOrders;
  };

  const addOrder = async (cartItems, totalPrice, discount = 0) => {
    const existingOrderNumbers = orders.value.map((o) => o.orderNumber);
    const maxOrderNumber =
      existingOrderNumbers.length > 0 ? Math.max(...existingOrderNumbers) : 0;
    const orderNumber = maxOrderNumber + 1;

    const orderData = {
      orderNumber,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
      discount,
    };

    const savedOrder = await db.addOrder(orderData);
    orders.value.unshift(savedOrder); // Add to beginning (newest first)
    return savedOrder;
  };

  const deleteOrder = async (orderId) => {
    await db.orders.delete(orderId);
    orders.value = orders.value.filter((order) => order.id !== orderId);
  };

  const getOrderById = (orderId) => {
    return orders.value.find((order) => order.id === orderId);
  };

  const updateOrder = async (
    orderId,
    updatedItems,
    updatedTotalPrice,
    discount = 0
  ) => {
    const updatedData = {
      items: updatedItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: updatedTotalPrice,
      discount,
    };

    const updatedOrder = await db.updateOrder(orderId, updatedData);

    const orderIndex = orders.value.findIndex((order) => order.id === orderId);
    if (orderIndex !== -1 && updatedOrder) {
      orders.value[orderIndex] = updatedOrder;
    }
  };

  onMounted(loadOrders);

  return {
    orders,
    addOrder,
    deleteOrder,
    getOrderById,
    updateOrder,
    loadOrders,
  };
};
