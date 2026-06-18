import { api } from "./api";

// Fetch all staff members registered under the current restaurant
export const getStaffMembers = async () => {
  const response = await api.get("/users/staff");
  return response.data.data;
};

// Create a new staff member (chef or waiter)
export const createStaffMember = async (payload: {
  name: string;
  email: string;
  role: "chef" | "waiter";
  password: string;
}) => {
  const response = await api.post("/users/staff", payload);
  return response.data.data;
};

// Delete a staff member
export const deleteStaffMember = async (id: string) => {
  const response = await api.delete(`/users/staff/${id}`);
  return response.data;
};
