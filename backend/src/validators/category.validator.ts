import { z } from "zod";

export const createCategorySchema = z.object({
  restaurantId: z.string(),

  name: z
    .string()
    .trim()
    .min(2, "Category name is required")
    .max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  sortOrder: z.number().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();