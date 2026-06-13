import { Restaurant } from "../models/Restaurant";

import {
  CreateRestaurantInput,
} from "../validators/restaurant.validator";

import {
  generateUniqueSlug,
} from "../utils/slug";

export const createRestaurant = async (
  data: CreateRestaurantInput,
  userId: string
) => {
  const slug =
    generateUniqueSlug(data.name);

  const restaurant =
    await Restaurant.create({
      ...data,

      slug,

      createdBy: userId,
    });

  return {
    id: restaurant._id.toString(),

    name: restaurant.name,

    slug: restaurant.slug,

    theme: restaurant.theme,
  };
};