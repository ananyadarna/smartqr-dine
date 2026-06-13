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