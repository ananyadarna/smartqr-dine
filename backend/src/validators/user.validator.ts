import { z } from "zod";
import { ROLES } from "../constants/roles";

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([ROLES.CHEF, ROLES.WAITER], {
    message: "Role must be either 'chef' or 'waiter'",
  }),
});
