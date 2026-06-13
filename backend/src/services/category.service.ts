import { Category } from "../models/Category";
import { Restaurant } from "../models/Restaurant";
import { CreateCategoryInput } from "../validators/category.validator";

export const createCategory = async (
  data: CreateCategoryInput,
  userId: string
) => {
  const restaurant = await Restaurant.findOne({
    _id: data.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const category = await Category.create(data);

  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
};

export const getCategoriesByRestaurant = async (
  restaurantId: string,
  userId: string
) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const categories = await Category.find({
    restaurantId,
  }).sort({
    sortOrder: 1,
    createdAt: 1,
  });

  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  }));
};

export const updateCategory = async (
  categoryId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: category.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Unauthorized");
  }

  Object.assign(category, data);

  await category.save();

  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
};

export const deleteCategory = async (
  categoryId: string,
  userId: string
) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: category.restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Unauthorized");
  }

  await Category.findByIdAndDelete(categoryId);

  return true;
};