import { Request, Response } from "express";
import { createFoodItemSchema, updateFoodItemSchema} from "../validators/food-item.validator";
import { createFoodItem, getFoodItemsByCategory, updateFoodItem, deleteFoodItem } from "../services/food-item.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const data = createFoodItemSchema.parse(req.body);

    const foodItem = await createFoodItem(
      data,
      user._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Food item created successfully",
      data: foodItem,
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

export const getByCategory = async (
  req: Request<{ categoryId: string }>,
  res: Response
) => {
  try {
    const foodItems =
      await getFoodItemsByCategory(
        req.params.categoryId
      );

    return res.status(200).json({
      success: true,
      data: foodItems,
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

export const update = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const data = updateFoodItemSchema.parse(req.body);

    const foodItem = await updateFoodItem(
      req.params.id,
      user._id.toString(),
      data
    );

    return res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      data: foodItem,
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

export const remove = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = (req as any).user;

    await deleteFoodItem(
      req.params.id,
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
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