import { api } from "./api";

export const createCategory = async (data: any) => {
  const response = await api.post("/categories", data);
  return response.data.data;
};

export const getCategoriesByRestaurant = async (restaurantId: string) => {
  const response = await api.get(`/categories/restaurant/${restaurantId}`);
  return response.data.data;
};

export const updateCategory = async (id: string, data: any) => {
  const response = await api.patch(`/categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data.data;
};
