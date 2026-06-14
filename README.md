# SmartQR Dine 🍽️

SmartQR Dine is a premium, multi-tenant restaurant SaaS platform featuring dynamic QR code ordering, real-time kitchen terminals, menu architect customization, and advanced business analytics.

Built with **Next.js**, **Tailwind CSS v4**, **Framer Motion**, and **Socket.io**, it bridges the connection between diners, waitstaff, and chefs.

---

## 📂 Project Structure

```
smartqr-dine/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API Request handlers (auth, restaurant, order...)
│   │   ├── models/           # Mongoose schemas (User, Restaurant, Category...)
│   │   ├── routes/           # Express routes mapping
│   │   ├── services/         # Database services and business logic
│   │   ├── middlewares/      # Authentication & body limits middlewares
│   │   └── server.ts         # Socket.io and express entry point
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App router pages (client & owner)
│   │   ├── components/       # Reusable UI controls (Zomato add-button...)
│   │   ├── services/         # Axios API clients
│   │   ├── stores/           # Zustand state management stores
│   │   └── lib/              # Socket.io and helper configs
│   ├── package.json
│   └── tailwind.config.ts
└── README.md
```

---

## ✨ Features

### 1. 🌐 Marketing Landing Page
* Stately dark-themed hero section with layout and dashboard product previews.
* Staggered feature list illustrating the digital menu, kitchen feeds, QR architect, and reporting.

### 2. 🔐 Authentication & Onboarding
* **Split-Screen Sign-in**: Sleek Navy brand showcase with glowing animated logo on the left; validation-ready inputs on the right.
* **Onboarding Wizard**: A multi-step setup guiding new owners through entering business details and selecting brand themes (Modern Bistro, Cozy Cafe, Fine Dining, Quick Diner). Bypasses sidebar elements for a focused full-screen layout.

### 3. 📊 Owner Dashboard Portal
* **Metrics Grid**: Spring-animated metric cards for Sales, Orders, Cooking, and Pending.
* **Live Orders Feed**: Staggered list updates dynamically when customer orders are received.
* **Kanban Kitchen Terminal**: Staged order progress: *Pending*, *Preparing*, and *Ready* slots. Plays dual-tone warning chimes when new orders arrive.
* **Menu Architect**: Category constructor with image drag-and-drop file uploaders (reads files locally as Base64 DataURLs).
* **Tables & QR Generator**: Auto-generates high-contrast table card layouts containing download buttons for print-ready QR PNG overlays.
* **Analytics Insights**: Interactive Area charts (Weekly Sales) and Bar charts (Quantity Sold) featuring linear gradients and glassmorphic hover tooltips.

### 4. 📱 Customer Ordering Experience
* **Mobile Menu**: Horizontal scroll tabs for fast category navigation, live search filters, and Unsplash-linked recipe items.
* **Zomato-Style Add Button**: Micro-animated stepper selector (`[-] {qty} [+]`) that expands on interaction.
* **Live Stepper Tracker**: Diner timeline reflecting step-by-step progress (*Received* ➔ *Cooking* ➔ *Ready* ➔ *Served*) updating in real-time via Socket.io.

---

## 🔗 Core API Endpoints

### 🔐 Authentication
* `POST /api/auth/register` — Create new user account.
* `POST /api/auth/login` — Sign in and receive token.
* `GET /api/auth/profile` — Fetch current user details (*Protected*).

### 🏢 Restaurants
* `POST /api/restaurants` — Create restaurant during onboarding (*Protected*).
* `GET /api/restaurants/:id` — Get restaurant profile settings (*Protected*).
* `PATCH /api/restaurants/:id` — Update restaurant logo, banner, theme (*Protected*).

### 🍔 Menu & Categories
* `GET /api/categories/restaurant/:restaurantId` — Fetch categories.
* `POST /api/categories` — Create category (*Protected*).
* `DELETE /api/categories/:id` — Delete category (*Protected*).
* `POST /api/food-items` — Create new dish (*Protected*).
* `PATCH /api/food-items/:id` — Update dish pricing or details (*Protected*).
* `DELETE /api/food-items/:id` — Delete dish (*Protected*).

### 📋 Orders & Tables
* `POST /api/orders` — Customer places a dining order.
* `GET /api/orders/restaurant/:restaurantId` — Fetch orders list (*Protected*).
* `PATCH /api/orders/:id/status` — Modify order status (*Protected*).
* `POST /api/tables` — Add table and trigger QR code generation (*Protected*).
* `GET /api/tables/restaurant/:restaurantId` — List tables (*Protected*).

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (Turbopack), Tailwind CSS v4, Framer Motion, Zustand (Persisted Storage), Axios, Recharts, Socket.io-Client, Lucide Icons.
* **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB Atlas), Socket.io, Zod Validator, JWT Authentication, QRCode.

---

## ⚙️ Advanced System Architecture

### 1. Base64 Upload Support (10MB Body limit)
The Express server is configured with `express.json({ limit: "10mb" })` in [server.ts](file:///c:/Users/anuda/smartqr-dine/backend/src/server.ts) to support inline base64 drag-and-drop local image uploads for menu items, logos, and banners, saving database records without requiring third-party storage.

### 2. Audio Chime Alerts (Web Audio API)
Audio context oscillators dynamically compile dual-tone synthesizer notes locally in the browser when new orders land. This prevents audio latency issues and works without loading static `.mp3` assets.

### 3. Real-Time Socket Events
* **`join_restaurant`**: Rooms segregated by `restaurantId` to isolate dashboard socket communication per tenant.
* **`new_order`**: Alerts kitchen screens and triggers chimes.
* **`order_status_updated`**: Updates the customer timeline progress tracking bar dynamically.

### 4. Category Mongoose ID Mapping
State mapping inside the menu panels resolves mongoose document differences by checking both `._id` and `.id` variables for categories to ensure selection highlight rings remain stable.

---

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   PUBLIC_MENU_URL=http://<YOUR_LOCAL_IP>:3000
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## 📱 Local Network Mobile Testing

For a phone to load the restaurant menu upon scanning generated QR codes on your local network:
1. **Connect to same Wi-Fi**: Connect both your computer and your phone to the same Wi-Fi network.
2. **Find Computer IP**: Find your computer's local network IPv4 address (e.g. `192.168.1.138`).
3. **Configure `.env`**: Set `PUBLIC_MENU_URL` in your backend `.env` file to point to your computer's local network IP (e.g., `PUBLIC_MENU_URL=http://192.168.1.138:3000`).
4. **Automatic Dynamic Routing**: The frontend is equipped with dynamic host resolution. Sockets and HTTP requests made from your phone's browser will automatically connect to your computer's backend (e.g., `http://192.168.1.138:5000`) instead of looking at `localhost`.
5. **Regenerate QRs**: Delete and re-create dining tables in the **Tables & QRs** section of the dashboard to generate codes mapped to your local IP.

---

## 🩹 Database Self-Healing

The backend includes a self-healing middleware. If a user logs out and logs back in, or accesses their profile on a new device, and their `restaurantId` was not linked in MongoDB's `users` collection:
* The system automatically scans for any existing `Restaurant` document created by that user's ID.
* It auto-links the user profile to their restaurant, preventing them from having to repeat the onboarding wizard and restoring their dashboard data instantly.
