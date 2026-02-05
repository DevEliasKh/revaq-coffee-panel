import { ref } from 'vue'

const orders = ref([])

export const useOrders = () => {
  const addOrder = (cartItems, totalPrice, discount = 0) => {
    const orderNumber = orders.value.length > 0 
      ? Math.max(...orders.value.map(o => o.orderNumber)) + 1 
      : 1
    
    const order = {
      id: Date.now(),
      orderNumber,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice,
      discount,
      createdAt: new Date().toISOString()
    }
    
    orders.value.unshift(order) // Add to beginning (newest first)
    return order
  }

  const deleteOrder = (orderId) => {
    orders.value = orders.value.filter(order => order.id !== orderId)
  }

  const getOrderById = (orderId) => {
    return orders.value.find(order => order.id === orderId)
  }

  const updateOrder = (orderId, updatedItems, updatedTotalPrice, discount = 0) => {
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].items = updatedItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
      orders.value[orderIndex].totalPrice = updatedTotalPrice
      orders.value[orderIndex].discount = discount
    }
  }

  return {
    orders,
    addOrder,
    deleteOrder,
    getOrderById,
    updateOrder
  }
}
