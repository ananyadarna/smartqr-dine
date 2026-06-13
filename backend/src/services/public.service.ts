import { Table } from "../models/Table";
import { Restaurant } from "../models/Restaurant";
import { Category } from "../models/Category";
import { FoodItem } from "../models/FoodItem";

export const getMenuByTableCode = async (
  tableCode: string
) => {
  const table = await Table.findOne({
    tableCode,
  });

  if (!table) {
    throw new Error(
      "Table not found"
    );
  }

  const restaurant =
    await Restaurant.findById(
      table.restaurantId
    );

  if (!restaurant) {
    throw new Error(
      "Restaurant not found"
    );
  }

  const categories =
    await Category.find({
      restaurantId:
        restaurant._id,
      isActive: true,
    }).sort({
      sortOrder: 1,
    });

  const menu = [];

  for (const category of categories) {
    const items =
      await FoodItem.find({
        categoryId:
          category._id,
        isAvailable: true,
      });

    menu.push({
      id: category._id.toString(),
      name: category.name,
      items: items.map(
        (item) => ({
          id:
            item._id.toString(),
          name: item.name,
          description:
            item.description,
          price: item.price,
          image:
            item.image,
          isFeatured:
            item.isFeatured,
        })
      ),
    });
  }

  return {
    restaurant: {
      id:
        restaurant._id.toString(),
      name:
        restaurant.name,
      slug:
        restaurant.slug,
      theme:
        restaurant.theme,
      logo:
        restaurant.logo,
      banner:
        restaurant.banner,
    },

    table: {
      id:
        table._id.toString(),
      tableNumber:
        table.tableNumber,
      tableName:
        table.name,
    },

    categories: menu,
  };
};