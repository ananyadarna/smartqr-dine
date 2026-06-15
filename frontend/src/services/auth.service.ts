import { api } from "./api";

export const loginUser = async (credentials: any) => {
  const response = await api.post("/auth/login", credentials);
  return response.data.data;
};

export const registerUser = async (userData: any) => {
  const response = await api.post("/auth/register", userData);
  return response.data.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data.data;
};

export const loginWithGoogle = async (credential: string) => {
  const response = await api.post("/auth/google", { credential });
  return response.data.data;
};
