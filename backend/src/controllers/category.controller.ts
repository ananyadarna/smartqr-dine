import { Request, Response } from "express";
import { createCategorySchema } from "../validators/category.validator";
import { createCategory } from "../services/category.service";

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