import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurant.routes";

import { connectDB } from "./config/database";
dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartQR Dine API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});