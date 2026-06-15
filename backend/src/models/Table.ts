import mongoose, { Document, Model } from "mongoose";

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  tableNumber: number;
  tableCode: string;
  qrCodeUrl: string;
  isActive: boolean;
  currentSessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new mongoose.Schema<ITable>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      default: "",
    },

    tableNumber: {
      type: Number,
      required: true,
    },

    tableCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    qrCodeUrl: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    currentSessionId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

tableSchema.index(
  {
    restaurantId: 1,
    tableNumber: 1,
  },
  {
    unique: true,
  }
);

export const Table: Model<ITable> =
  mongoose.models.Table ||
  mongoose.model<ITable>("Table", tableSchema);