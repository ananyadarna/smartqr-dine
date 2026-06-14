import { api } from "./api";

export const getDashboardStats = async (
  restaurantId: string
) => {
  const response = await api.get(
    `/dashboard/${restaurantId}`
  );

  return response.data.data;
};

export const getRecentOrders = async (
  restaurantId: string
) => {
  const response = await api.get(
    `/dashboard/${restaurantId}/recent-orders`
  );

  return response.data.data;
};

export const getAnalytics = async (
  restaurantId: string
) => {
  const response = await api.get(
    `/dashboard/${restaurantId}/analytics`
  );

  return response.data.data;
};