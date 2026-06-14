import { Order } from "../models/Order";
import { Table } from "../models/Table";
import { FoodItem } from "../models/FoodItem";
import { Restaurant } from "../models/Restaurant";
import { CreateOrderInput } from "../validators/order.validator";
import { getIO} from "../sockets";

const generateOrderNumber = () => {
    return `ORD-${Date.now()}`
};

export const createOrder = async (
  data: CreateOrderInput
) => {
  const restaurant =
    await Restaurant.findById(
      data.restaurantId
    );

  if (!restaurant) {
    throw new Error(
      "Restaurant not found"
    );
  }

  const table = await Table.findById( data.tableId );

  if (!table) {
    throw new Error(
      "Table not found"
    );
  }

  let totalAmount = 0;

  const orderItems = [];

  for (const item of data.items) {
    const foodItem = await FoodItem.findById( item.foodId );

    if (!foodItem) {
      throw new Error(
        "Food item not found"
      );
    }

    const itemTotal = foodItem.price * item.quantity;

    totalAmount += itemTotal;

    orderItems.push({
      foodId: foodItem._id,
      name: foodItem.name,
      quantity: item.quantity,
      price: foodItem.price,
      customizations:
        item.customizations || [],
    });
  }

  const order =
    await Order.create({
      restaurantId:
        data.restaurantId,

      tableId: data.tableId,

      tableNumber: table.tableNumber,
      tableName: table.name,

      orderNumber: generateOrderNumber(),

      items: orderItems,

      totalAmount,

      customerNote:
        data.customerNote || "",

      status: "pending",
    });

    // Emit real-time event to restaurant dashboard
    const io = getIO();

    io.to(data.restaurantId).emit(
    "new_order",
    {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        tableName: order.tableName,
        totalAmount: order.totalAmount,
        status: order.status,
    }
    );


  return {
    id: order._id.toString(),
    orderNumber:
      order.orderNumber,
    totalAmount:
      order.totalAmount,
    status: order.status,
  };
};

export const getOrdersByRestaurant = async (
  restaurantId: string
) => {
  const orders = await Order.find({
    restaurantId,
  }).sort({
    createdAt: -1,
  });

  return orders.map((order) => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    tableName: order.tableName,
    totalAmount: order.totalAmount,
    status: order.status,
    items: order.items,
    customerNote: order.customerNote,
    createdAt: order.createdAt,
  }));
};

export const updateOrderStatus = async (
  orderId: string,
  status:
    | "pending"
    | "accepted"
    | "preparing"
    | "ready"
    | "served"
) => {
  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  order.status = status;

  await order.save();

  // Emit real-time event to restaurant dashboard
  const io = getIO();

  io.to(
    order.restaurantId.toString()
  ).emit(
    "order_status_updated",
    {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
    }
 );

  return {
    id: order._id.toString(),
    orderNumber:
      order.orderNumber,
    status: order.status,
  };
};

export const getOrderById = async (
  orderId: string
) => {
  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    tableName: order.tableName,
    items: order.items,
    totalAmount: order.totalAmount,
    customerNote: order.customerNote,
    status: order.status,

    progress: {
      pending: true,

      accepted: [
        "accepted",
        "preparing",
        "ready",
        "served",
      ].includes(order.status),

      preparing: [
        "preparing",
        "ready",
        "served",
      ].includes(order.status),

      ready: [
        "ready",
        "served",
      ].includes(order.status),

      served:
        order.status === "served",
    },

    createdAt: order.createdAt,
  };
}