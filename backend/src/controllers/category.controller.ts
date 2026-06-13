import { Request, Response } from "express";
import { createCategorySchema, updateCategorySchema, } from "../validators/category.validator";
import { createCategory, getCategoriesByRestaurant, updateCategory, deleteCategory } from "../services/category.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const data = createCategorySchema.parse(
      req.body
    );

    const category = await createCategory(
      data,
      user._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
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

export const getByRestaurant = async (
  req: Request<{ restaurantId: string }>,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const categories =
      await getCategoriesByRestaurant(
        req.params.restaurantId,
        user._id.toString()
      );

    return res.status(200).json({
      success: true,
      data: categories,
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

    const data = updateCategorySchema.parse(req.body);

    const category = await updateCategory(
      req.params.id,
      user._id.toString(),
      data
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
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

    await deleteCategory(
      req.params.id,
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
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