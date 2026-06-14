export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isFeatured: boolean;
}

export interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuResponse {
  restaurant: {
    id: string;
    name: string;
    theme: string;
    logo: string;
    banner: string;
  };

  table: {
    id: string;
    tableNumber: number;
    tableName: string;
  };

  categories: Category[];
}