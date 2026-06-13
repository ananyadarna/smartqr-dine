import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { create, getByRestaurant } from "../controllers/category.controller";

const router = Router();

router.post("/", protect, create);
router.get("/restaurant/:restaurantId", protect, getByRestaurant);

export default router;