import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { create, getByRestaurant, update, remove } from "../controllers/category.controller";

const router = Router();

router.post("/", protect, create);
router.get("/restaurant/:restaurantId", protect, getByRestaurant);
router.patch("/:id", protect, update);
router.delete("/:id", protect, remove);


export default router;