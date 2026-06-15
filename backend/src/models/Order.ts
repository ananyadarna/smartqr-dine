import mongoose, { Document, Model } from "mongoose";

export interface IOrderItem {
  foodId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  customizations: string[];
}

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  tableNumber: number;
  tableName: string;
  tableCode?: string;
  tableSessionId?: string;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  customerNote: string;
  status:
    | "pending"
    | "accepted"
    | "preparing"
    | "ready"
    | "served";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    customizations: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    
    tableNumber: {
      type: Number,
      required: true,
    },

    tableName: {
      type: String,
      required: true,
    },

    tableCode: {
      type: String,
      default: "",
    },

    tableSessionId: {
      type: String,
      default: "",
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    customerNote: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "served",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({
  restaurantId: 1,
  status: 1,
});

export const Order: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", orderSchema);