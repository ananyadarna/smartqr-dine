import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import { initializeSocket } from "./sockets";
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import categoryRoutes from "./routes/category.routes";
import foodItemRoutes from "./routes/food-item.routes";
import tableRoutes from "./routes/table.routes";
import qrRoutes from "./routes/qr.routes";
import orderRoutes from "./routes/order.routes";
import publicRoutes from "./routes/public.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";

import { connectDB } from "./config/database";
import { regenerateAllTableQRs } from "./services/qr.service";
dotenv.config();

const app = express();

connectDB().then(async () => {
  await regenerateAllTableQRs();

  // Self-healing migration: populate subdomain from slug for legacy restaurants
  try {
    const { Restaurant } = await import("./models/Restaurant");
    const restaurants = await Restaurant.find({ 
      $or: [{ subdomain: { $exists: false } }, { subdomain: "" }] 
    });
    if (restaurants.length > 0) {
      console.log(`Running database migration: Populating subdomains for ${restaurants.length} restaurants...`);
      for (const rest of restaurants) {
        rest.subdomain = rest.slug;
        await rest.save();
      }
      console.log("Database migration completed successfully!");
    }
  } catch (err) {
    console.error("Database subdomain migration failed:", err);
  }
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartQR Dine API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/food-items", foodItemRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});