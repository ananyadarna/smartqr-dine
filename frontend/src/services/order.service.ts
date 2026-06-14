import { api } from "./api";

export const createOrder = async (payload: any) => {
  const response = await api.post("/orders", payload);
  return response.data.data;
};

export const getOrder = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};

export const getOrdersByRestaurant = async (restaurantId: string) => {
  const response = await api.get(`/orders/restaurant/${restaurantId}`);
  return response.data.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  console.log(orderId, status)
  const response = await api.patch(`/orders/${orderId}/status`,{ status });
  return response.data.data;
};