# SmartQR Dine Database Design

## Overview

SmartQR Dine is a multi-tenant restaurant SaaS platform that enables restaurants to:

* Manage digital menus
* Generate QR codes for table ordering
* Accept and process customer orders
* Handle food customizations and allergy information
* Manage kitchen workflows
* Track order statuses in real-time

The MVP is built around six core collections:

1. Users
2. Restaurants
3. Categories
4. FoodItems
5. Tables
6. Orders

---

# Database Relationships

```text
Restaurant
│
├── Users
├── Categories
├── FoodItems
├── Tables
└── Orders
```

All operational data belongs to a restaurant.

---

# 1. Users

Stores restaurant staff and platform administrators.

## Roles

* owner
* chef
* waiter
* admin

## Schema

```ts
{
  _id: ObjectId,

  name: string,

  email: string,

  password: string,

  role: "owner" | "chef" | "waiter" | "admin",

  restaurantId: ObjectId | null,

  isActive: boolean,

  lastLoginAt: Date | null,

  createdAt: Date,

  updatedAt: Date
}
```

## Indexes

```text
email (unique)
restaurantId
role
```

---

# 2. Restaurants

Stores restaurant profile information.

## Schema

```ts
{
  _id: ObjectId,

  name: string,

  slug: string,

  logo: string,

  banner: string,

  phone: string,

  email: string,

  address: string,

  theme:
    | "modern"
    | "cafe"
    | "luxury"
    | "fastfood",

  isPublished: boolean,

  createdBy: ObjectId,

  createdAt: Date,

  updatedAt: Date
}
```

## Example

```json
{
  "name": "Foodies",
  "slug": "foodies",
  "theme": "modern"
}
```

## Indexes

```text
slug (unique)
createdBy
```

---

# 3. Categories

Used to organize menu items.

## Examples

* Starters
* Burgers
* Pizza
* Desserts
* Drinks

## Schema

```ts
{
  _id: ObjectId,

  restaurantId: ObjectId,

  name: string,

  description: string,

  sortOrder: number,

  isActive: boolean,

  createdAt: Date,

  updatedAt: Date
}
```

## Indexes

```text
restaurantId
restaurantId + sortOrder
```

---

# 4. FoodItems

Stores menu items.

## Schema

```ts
{
  _id: ObjectId,

  restaurantId: ObjectId,

  categoryId: ObjectId,

  name: string,

  description: string,

  image: string,

  price: number,

  isAvailable: boolean,

  allergens: string[],

  customizationOptions: [
    {
      name: string,

      type: "single" | "multiple",

      choices: [
        {
          label: string,

          extraPrice: number
        }
      ]
    }
  ],

  createdAt: Date,

  updatedAt: Date
}
```

## Example

```json
{
  "name": "Chicken Burger",
  "price": 199,
  "allergens": ["gluten"],
  "customizationOptions": [
    {
      "name": "Spice Level",
      "type": "single",
      "choices": [
        {
          "label": "Mild",
          "extraPrice": 0
        },
        {
          "label": "Medium",
          "extraPrice": 0
        },
        {
          "label": "Hot",
          "extraPrice": 0
        }
      ]
    }
  ]
}
```

## Indexes

```text
restaurantId
categoryId
restaurantId + categoryId
```

---

# 5. Tables

Stores restaurant tables and generated QR codes.

## Schema

```ts
{
  _id: ObjectId,

  restaurantId: ObjectId,

  tableNumber: number,

  tableName: string,

  qrCodeUrl: string,

  isActive: boolean,

  createdAt: Date,

  updatedAt: Date
}
```

## Example

```json
{
  "tableNumber": 4,
  "tableName": "Table 4"
}
```

## Indexes

```text
restaurantId
restaurantId + tableNumber
```

---

# 6. Orders

Stores customer orders.

## Order Status Flow

```text
pending
   ↓
accepted
   ↓
preparing
   ↓
ready
   ↓
delivered
```

## Schema

```ts
{
  _id: ObjectId,

  restaurantId: ObjectId,

  tableId: ObjectId,

  orderNumber: string,

  items: [
    {
      foodId: ObjectId,

      name: string,

      quantity: number,

      unitPrice: number,

      customizations: [
        {
          option: string,

          value: string,

          extraPrice: number
        }
      ]
    }
  ],

  totalAmount: number,

  customerNote: string,

  status:
    | "pending"
    | "accepted"
    | "preparing"
    | "ready"
    | "delivered",

  acceptedAt: Date | null,

  readyAt: Date | null,

  deliveredAt: Date | null,

  createdAt: Date,

  updatedAt: Date
}
```

## Indexes

```text
restaurantId
tableId
status
restaurantId + status
createdAt
```

---

# Order Lifecycle

```text
Customer Places Order
          │
          ▼
       Pending
          │
          ▼
      Accepted
          │
          ▼
      Preparing
          │
          ▼
         Ready
          │
          ▼
      Delivered
```

---

# MVP Scope

These collections support:

* Authentication
* Role-based access
* Restaurant management
* Menu management
* Food customization
* QR ordering
* Kitchen workflows
* Real-time order tracking

No analytics, payments, subscriptions, loyalty programs, or AI features are included in the MVP database design.
