import { api } from "./api";

export const createOrder = async (payload: any) => {
  const response = await api.post("/orders", payload);
  return response.data.data;
};

export const getOrder = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};