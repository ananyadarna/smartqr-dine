import { Request, Response } from "express";
import { createTableSchema } from "../validators/table.validator";
import { createTable, getTablesByRestaurant, updateTable, deleteTable, clearTableSession } from "../services/table.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const data = createTableSchema.parse(req.body);

    const table = await createTable(
      data,
      user._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
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

    const tables = await getTablesByRestaurant(
      req.params.restaurantId,
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      data: tables,
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

    const table = await updateTable(
      req.params.id,
      user._id.toString(),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
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

    await deleteTable(
      req.params.id,
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Table deleted successfully",
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

export const clearSession = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const table = await clearTableSession(
      req.params.id,
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Table session cleared successfully",
      data: table,
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