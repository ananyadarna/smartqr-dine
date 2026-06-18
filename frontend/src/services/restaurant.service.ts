import { api } from "./api";

export const createRestaurant = async (data: any) => {
  const response = await api.post("/restaurants", data);
  return response.data.data;
};

export const getRestaurants = async () => {
  const response = await api.get("/restaurants");
  return response.data.data;
};

export const getRestaurant = async (id: string) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data.data;
};

export const updateRestaurant = async (id: string, data: any) => {
  const response = await api.patch(`/restaurants/${id}`, data);
  return response.data.data;
};

export const getRestaurantBySubdomain = async (subdomain: string) => {
  const response = await api.get(`/public/restaurant/subdomain/${subdomain}`);
  return response.data.data;
};
