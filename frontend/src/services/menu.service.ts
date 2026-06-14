import { api } from "./api";
import { MenuResponse } from "@/types/menu";

export const getMenu = async (
  tableCode: string
): Promise<MenuResponse> => {
  const response = await api.get(
    `/public/menu/${tableCode}`
  );

  return response.data.data;
};