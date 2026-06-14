import { Restaurant } from "../models/Restaurant";
import { User } from "../models/User";
import {CreateRestaurantInput,} from "../validators/restaurant.validator";
import {generateUniqueSlug,} from "../utils/slug";

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

  // Update the user's restaurantId in MongoDB
  await User.findByIdAndUpdate(userId, {
    restaurantId: restaurant._id,
  });

  return {
    id: restaurant._id.toString(),
    name: restaurant.name,
    slug: restaurant.slug,
    theme: restaurant.theme,
    logo: restaurant.logo,
    banner: restaurant.banner,
  };
};

export const getRestaurants = async (
  userId: string
) => {
  const restaurants =
    await Restaurant.find({
      createdBy: userId,
    })
      .select(
        "_id name slug theme isPublished createdAt"
      )
      .sort({
        createdAt: -1,
      });

  return restaurants.map(
    (restaurant) => ({
      id: restaurant._id.toString(),
      name: restaurant.name,
      slug: restaurant.slug,
      theme: restaurant.theme,
      isPublished:
        restaurant.isPublished,
      createdAt:
        restaurant.createdAt,
    })
  );
};

export const getRestaurantById = async (
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

  return {
    id: restaurant._id.toString(),
    name: restaurant.name,
    slug: restaurant.slug,
    phone: restaurant.phone,
    email: restaurant.email,
    address: restaurant.address,
    theme: restaurant.theme,
    logo: restaurant.logo,
    banner: restaurant.banner,
    isPublished: restaurant.isPublished,
  };
};

export const updateRestaurant = async (
  restaurantId: string,
  userId: string,
  data: Partial<CreateRestaurantInput>
) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    createdBy: userId,
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  Object.assign(restaurant, data);

  await restaurant.save();

  return {
    id: restaurant._id.toString(),
    name: restaurant.name,
    slug: restaurant.slug,
    phone: restaurant.phone,
    email: restaurant.email,
    address: restaurant.address,
    theme: restaurant.theme,
    logo: restaurant.logo,
    banner: restaurant.banner,
    isPublished: restaurant.isPublished,
  };
};