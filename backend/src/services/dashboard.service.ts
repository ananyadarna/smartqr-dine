import mongoose from "mongoose";
import { Order } from "../models/Order";

export const getDashboardStats = async (
  restaurantId: string
) => {
  const totalOrders =
    await Order.countDocuments({
      restaurantId,
    });

 const acceptedOrders =
    await Order.countDocuments({
      restaurantId,
      status: "accepted",
    });

  const pendingOrders =
    await Order.countDocuments({
      restaurantId,
      status: "pending",
    });

  const preparingOrders =
    await Order.countDocuments({
      restaurantId,
      status: "preparing",
    });

  const readyOrders =
    await Order.countDocuments({
      restaurantId,
      status: "ready",
    });

  const servedOrders =
    await Order.countDocuments({
      restaurantId,
      status: "served",
    });

  const revenueResult =
    await Order.aggregate([
      {
        $match: {
          restaurantId:
            new mongoose.Types.ObjectId(
              restaurantId
            ),
          status: "served",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

  const totalRevenue =
    revenueResult[0]?.totalRevenue || 0;

  return {
    totalOrders,
    acceptedOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    servedOrders,
    totalRevenue,
  };
};

export const getRecentOrders = async (
  restaurantId: string
) => {
  const orders = await Order.find({
    restaurantId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(10);

  return orders.map((order) => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    tableName: order.tableName,
    tableSessionId: order.tableSessionId,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
  }));
};

export const getAnalytics = async (
  restaurantId: string
) => {
  const revenueResult =
    await Order.aggregate([
      {
        $match: {
          restaurantId:
            new mongoose.Types.ObjectId(
              restaurantId
            ),
          status: "served",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
          averageOrderValue: {
            $avg: "$totalAmount",
          },
          totalOrders: {
            $sum: 1,
          },
        },
      },
    ]);

  const topSellingItems =
    await Order.aggregate([
      {
        $match: {
          restaurantId:
            new mongoose.Types.ObjectId(
              restaurantId
            ),
          status: "served",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.name",
          quantity: {
            $sum: "$items.quantity",
          },
        },
      },
      {
        $sort: {
          quantity: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

  return {
    totalRevenue:
      revenueResult[0]?.totalRevenue || 0,

    averageOrderValue:
      Math.round(
        revenueResult[0]
          ?.averageOrderValue || 0
      ),

    totalOrders:
      revenueResult[0]?.totalOrders || 0,

    topSellingItems,
  };
};