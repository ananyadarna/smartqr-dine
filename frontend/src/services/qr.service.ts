import { api } from "./api";

export const generateQR = async (tableId: string) => {
  const response = await api.post(`/qr/generate/${tableId}`);
  return response.data.data;
};
