import { Request, Response } from "express";

import { getDashboardStats, getRecentOrders, getAnalytics } from "../services/dashboard.service";

export const getStats = async (
  req: Request<{ restaurantId: string }>,
  res: Response
) => {
  try {
    const stats =
      await getDashboardStats(
        req.params.restaurantId
      );

    return res.status(200).json({
      success: true,
      data: stats,
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

export const getRecent = async (
  req: Request<{ restaurantId: string }>,
  res: Response
) => {
  try {
    const orders =
      await getRecentOrders(
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

export const analytics = async (
  req: Request<{ restaurantId: string }>,
  res: Response
) => {
  try {
    const data =
      await getAnalytics(
        req.params.restaurantId
      );

    return res.status(200).json({
      success: true,
      data,
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