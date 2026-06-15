import { api } from "./api";

export const createTable = async (data: any) => {
  const response = await api.post("/tables", data);
  return response.data.data;
};

export const getTablesByRestaurant = async (restaurantId: string) => {
  const response = await api.get(`/tables/restaurant/${restaurantId}`);
  return response.data.data;
};

export const updateTable = async (id: string, data: any) => {
  const response = await api.patch(`/tables/${id}`, data);
  return response.data.data;
};

export const deleteTable = async (id: string) => {
  const response = await api.delete(`/tables/${id}`);
  return response.data.data;
};

export const clearTableSession = async (id: string) => {
  const response = await api.post(`/tables/${id}/clear`);
  return response.data.data;
};
