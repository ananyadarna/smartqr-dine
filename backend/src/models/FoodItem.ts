import mongoose, { Document, Model } from "mongoose";

interface ICustomizationOption {
  name: string;
  choices: string[];
}

export interface IFoodItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
  customizationOptions: ICustomizationOption[];
  createdAt: Date;
  updatedAt: Date;
}

const customizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    choices: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    _id: false,
  }
);

const foodItemSchema = new mongoose.Schema<IFoodItem>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    allergens: {
      type: [String],
      default: [],
    },

    customizationOptions: {
      type: [customizationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const FoodItem: Model<IFoodItem> =
  mongoose.models.FoodItem ||
  mongoose.model<IFoodItem>("FoodItem", foodItemSchema);