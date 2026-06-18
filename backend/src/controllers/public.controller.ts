import { Request, Response } from "express";

import { getMenuByTableCode } from "../services/public.service";
import { Restaurant } from "../models/Restaurant";

export const getMenu = async (
  req: Request<{ tableCode: string }>,
  res: Response
) => {
  try {
    const menu =
      await getMenuByTableCode(
        req.params.tableCode
      );

    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export const getRestaurantBySubdomain = async (
  req: Request<{ subdomain: string }>,
  res: Response
) => {
  try {
    const restaurant = await Restaurant.findOne({
      subdomain: req.params.subdomain.toLowerCase(),
    }).select("name logo banner theme phone email address");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        logo: restaurant.logo,
        banner: restaurant.banner,
        theme: restaurant.theme,
        phone: restaurant.phone,
        email: restaurant.email,
        address: restaurant.address,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};