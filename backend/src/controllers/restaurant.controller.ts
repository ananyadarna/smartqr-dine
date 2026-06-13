import { Request, Response, } from "express";

import { createRestaurantSchema, } from "../validators/restaurant.validator";

import { createRestaurant, } from "../services/restaurant.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      createRestaurantSchema.parse(
        req.body
      );

    const user =
      (req as any).user;

    const restaurant =
      await createRestaurant(
        data,
        user._id.toString()
      );

    return res.status(201).json({
      success: true,

      message:
        "Restaurant created successfully",

      data: restaurant,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};