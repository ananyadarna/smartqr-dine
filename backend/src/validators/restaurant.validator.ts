import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name cannot exceed 100 characters"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),

  email: z
    .email("Invalid email address")
    .toLowerCase(),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address cannot exceed 500 characters"),

  subdomain: z
    .string()
    .trim()
    .min(3, "Subdomain must be at least 3 characters")
    .max(30, "Subdomain cannot exceed 30 characters")
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),

  theme: z.enum([
    "modern",
    "cafe",
    "luxury",
    "fastfood",
  ]),

  logo: z.string().optional(),
  banner: z.string().optional(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export const updateRestaurantSchema = createRestaurantSchema.partial();