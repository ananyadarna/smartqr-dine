import { Request, Response, } from "express";

import { createRestaurantSchema, updateRestaurantSchema} from "../validators/restaurant.validator";

import { createRestaurant, getRestaurants, getRestaurantById, updateRestaurant } from "../services/restaurant.service";


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

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const user =
      (req as any).user;

    const restaurants =
      await getRestaurants(
        user._id.toString()
      );

    return res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const getOne = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const restaurant = await getRestaurantById(
      String(req.params.id),
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export const update = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const data = updateRestaurantSchema.parse(req.body);

    const restaurant = await updateRestaurant(
      req.params.id,
      user._id.toString(),
      data
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
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