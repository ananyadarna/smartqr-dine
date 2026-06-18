import mongoose, { Document, Model } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  phone: string;
  email: string;
  address: string;

  theme:
    | "modern"
    | "cafe"
    | "luxury"
    | "fastfood";

  isPublished: boolean;

  createdBy: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema =
  new mongoose.Schema<IRestaurant>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },

      logo: {
        type: String,
        default: "",
      },

      banner: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      theme: {
        type: String,
        enum: [
          "modern",
          "cafe",
          "luxury",
          "fastfood",
        ],
        default: "modern",
      },

      isPublished: {
        type: Boolean,
        default: false,
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

export const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>(
    "Restaurant",
    restaurantSchema
  );