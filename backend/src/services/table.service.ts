import mongoose from "mongoose";
import { Table } from "../models/Table";
import { Restaurant } from "../models/Restaurant";
import { CreateTableInput } from "../validators/table.validator";


const generateTableCode = () => {
  return `tbl_${Math.random()
    .toString(36)
    .substring(2, 8)}`;
};

export const createTable = async (
  data: CreateTableInput,
  userId: string
) => {
  const restaurant = await Restaurant.findOne({
    _id: data.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const existingTable = await Table.findOne({
    restaurantId: data.restaurantId,
    tableNumber: data.tableNumber,
  });

  if (existingTable) {
    throw new Error("Table already exists");
  }

  const table = await Table.create({
    ...data,
    name: `Table ${data.tableNumber}`,
    tableCode: generateTableCode(),
  });

  return {
    id: table._id.toString(),
    tableNumber: table.tableNumber,
    tableCode: table.tableCode,
    name: table.name,
    isActive: table.isActive,
  };
};

export const getTablesByRestaurant = async (
  restaurantId: string,
  userId: string
) => {
  let restaurant = await Restaurant.findOne({
    _id: restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    const { User } = await import("../models/User");
    const user = await User.findOne({ _id: userId, restaurantId });
    if (!user) {
      throw new Error("Restaurant not found");
    }
  }

  const tables = await Table.find({
    restaurantId,
  }).sort({
    tableNumber: 1,
  });

  return tables.map((table) => ({
    id: table._id.toString(),
    tableNumber: table.tableNumber,
    tableCode: table.tableCode,
    name: table.name,
    qrCodeUrl: table.qrCodeUrl,
    isActive: table.isActive,
    currentSessionId: table.currentSessionId,
  }));
};

export const updateTable = async (
  tableId: string,
  userId: string,
  data: {
    name?: string;
    isActive?: boolean;
  }
) => {
  const table = await Table.findById(tableId);

  if (!table) {
    throw new Error("Table not found");
  }

  let restaurant = await Restaurant.findOne({
    _id: table.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    const { User } = await import("../models/User");
    const user = await User.findOne({ _id: userId, restaurantId: table.restaurantId });
    if (!user || !["owner", "admin"].includes(user.role)) {
      throw new Error("Unauthorized");
    }
  }

  Object.assign(table, data);

  await table.save();

  return {
    id: table._id.toString(),
    tableNumber: table.tableNumber,
    tableCode: table.tableCode,
    name: table.name,
    isActive: table.isActive,
  };
};

export const deleteTable = async (
  tableId: string,
  userId: string
) => {
  const table = await Table.findById(tableId);

  if (!table) {
    throw new Error("Table not found");
  }

  let restaurant = await Restaurant.findOne({
    _id: table.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    const { User } = await import("../models/User");
    const user = await User.findOne({ _id: userId, restaurantId: table.restaurantId });
    if (!user || !["owner", "admin"].includes(user.role)) {
      throw new Error("Unauthorized");
    }
  }

  await Table.findByIdAndDelete(tableId);

  return true;
};

export const clearTableSession = async (
  tableId: string,
  userId: string
) => {
  const table = await Table.findById(tableId);

  if (!table) {
    throw new Error("Table not found");
  }

  let restaurant = await Restaurant.findOne({
    _id: table.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    const { User } = await import("../models/User");
    const user = await User.findOne({ _id: userId, restaurantId: table.restaurantId });
    if (!user || !["owner", "admin"].includes(user.role)) {
      throw new Error("Unauthorized");
    }
  }

  // Set a fresh session ID
  table.currentSessionId = new mongoose.Types.ObjectId().toString();

  await table.save();

  return {
    id: table._id.toString(),
    tableNumber: table.tableNumber,
    tableCode: table.tableCode,
    name: table.name,
    isActive: table.isActive,
    currentSessionId: table.currentSessionId,
  };
};