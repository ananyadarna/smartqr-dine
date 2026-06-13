import { z } from "zod";

export const createFoodItemSchema = z.object({
  restaurantId: z.string(),
  categoryId: z.string(),

  name: z.string().trim().min(2).max(100),

  description: z.string().optional(),

  image: z.string().optional(),

  price: z.number().positive(),

  allergens: z.array(z.string()).optional(),

  isFeatured: z.boolean().optional(),

  customizationOptions: z
    .array(
      z.object({
        name: z.string(),
        choices: z.array(z.string()),
      })
    )
    .optional(),
});

export type CreateFoodItemInput =
  z.infer<typeof createFoodItemSchema>;

export const updateFoodItemSchema =
  createFoodItemSchema.partial();