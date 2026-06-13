import { z } from "zod";

export const createTableSchema = z.object({
  restaurantId: z.string(),

  tableNumber: z.number().int().positive(),
});

export type CreateTableInput =
  z.infer<typeof createTableSchema>;

export const updateTableSchema =
  createTableSchema.partial();