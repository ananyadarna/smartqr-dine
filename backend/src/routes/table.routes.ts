import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { create, getByRestaurant, update, remove, clearSession } from "../controllers/table.controller";

const router = Router();

router.post("/", protect, create);
router.get("/restaurant/:restaurantId", protect, getByRestaurant);
router.patch("/:id", protect, update);
router.post("/:id/clear", protect, clearSession);
router.delete("/:id", protect, remove);

export default router;