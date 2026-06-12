import mongoose, { Document, Model } from "mongoose";
import { ROLES } from "../constants/roles";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  restaurantId: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.OWNER,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent model overwrite during development hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);