import { Request, Response } from "express";

import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.validator";
import { createOrder, getOrdersByRestaurant , getOrderById, updateOrderStatus, getOrdersByTable, getOrdersBySession } from "../services/order.service";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createOrderSchema.parse(
      req.body
    );

    const order = await createOrder(data);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
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
    const orders =
      await getOrdersByRestaurant(
        req.params.restaurantId
      );

    return res.status(200).json({
      success: true,
      data: orders,
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

export const updateStatus = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { status } =
      updateOrderStatusSchema.parse(
        req.body
      );

    const order =
      await updateOrderStatus(
        req.params.id,
        status
      );

    return res.status(200).json({
      success: true,
      message:
        "Order status updated",
      data: order,
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

export const getOne = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const order =
      await getOrderById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: order,
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

export const getByTable = async (
  req: Request<{ tableId: string }>,
  res: Response
) => {
  try {
    const orders =
      await getOrdersByTable(
        req.params.tableId
      );

    return res.status(200).json({
      success: true,
      data: orders,
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

export const getBySession = async (
  req: Request<{ tableSessionId: string }>,
  res: Response
) => {
  try {
    const orders =
      await getOrdersBySession(
        req.params.tableSessionId
      );

    return res.status(200).json({
      success: true,
      data: orders,
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