import { FoodItem } from "../models/FoodItem";
import { Category } from "../models/Category";
import { Restaurant } from "../models/Restaurant";
import { CreateFoodItemInput } from "../validators/food-item.validator";

export const createFoodItem = async (
  data: CreateFoodItemInput,
  userId: string
) => {
  const restaurant = await Restaurant.findOne({
    _id: data.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const category = await Category.findOne({
    _id: data.categoryId,
    restaurantId: data.restaurantId,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const foodItem = await FoodItem.create(data);

  return {
    id: foodItem._id.toString(),
    name: foodItem.name,
    description: foodItem.description,
    image: foodItem.image,
    price: foodItem.price,
    isAvailable: foodItem.isAvailable,
    isFeatured: foodItem.isFeatured,
    categoryId: foodItem.categoryId.toString(),
    restaurantId: foodItem.restaurantId.toString(),
    allergens: foodItem.allergens || [],
    customizationOptions: foodItem.customizationOptions || [],
  };
};

export const getFoodItemsByCategory = async (
  categoryId: string
) => {
  const foodItems = await FoodItem.find({
    categoryId,
  }).sort({
    createdAt: -1,
  });

  return foodItems.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description,
    image: item.image,
    price: item.price,
    isAvailable: item.isAvailable,
    allergens: item.allergens,
    customizationOptions:
      item.customizationOptions,
  }));
};

export const updateFoodItem = async (
  foodItemId: string,
  userId: string,
  data: any
) => {
  const foodItem = await FoodItem.findById(foodItemId);

  if (!foodItem) {
    throw new Error("Food item not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: foodItem.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Unauthorized");
  }

  Object.assign(foodItem, data);

  await foodItem.save();

  return foodItem;
};

export const deleteFoodItem = async (
  foodItemId: string,
  userId: string
) => {
  const foodItem = await FoodItem.findById(foodItemId);

  if (!foodItem) {
    throw new Error("Food item not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: foodItem.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Unauthorized");
  }

  await FoodItem.findByIdAndDelete(foodItemId);

  return true;
};