import { api } from "./api";

export const createFoodItem = async (data: any) => {
  const response = await api.post("/food-items", data);
  return response.data.data;
};

export const getFoodItemsByCategory = async (categoryId: string) => {
  const response = await api.get(`/food-items/category/${categoryId}`);
  return response.data.data;
};

export const updateFoodItem = async (id: string, data: any) => {
  const response = await api.patch(`/food-items/${id}`, data);
  return response.data.data;
};

export const deleteFoodItem = async (id: string) => {
  const response = await api.delete(`/food-items/${id}`);
  return response.data.data;
};
