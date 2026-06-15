import { z } from "zod";

export const createOrderSchema = z.object({
  restaurantId: z.string(),

  tableId: z.string(),

  tableSessionId: z.string().optional(),

  items: z
    .array(
      z.object({
        foodId: z.string(),
        quantity: z.number().int().positive(),
        customizations: z
          .array(z.string())
          .optional(),
      })
    )
    .min(1),

  customerNote: z.string().optional(),
});

export const updateOrderStatusSchema =
  z.object({
    status: z.enum([
      "pending",
      "accepted",
      "preparing",
      "ready",
      "served",
    ]),
  });

export type CreateOrderInput =
  z.infer<typeof createOrderSchema>;