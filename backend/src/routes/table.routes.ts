import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { create, getByRestaurant, update, remove, clearSession } from "../controllers/table.controller";

const router = Router();

router.post("/", protect, restrictTo("owner", "admin"), create);
router.get("/restaurant/:restaurantId", protect, getByRestaurant);
router.patch("/:id", protect, restrictTo("owner", "admin"), update);
router.post("/:id/clear", protect, restrictTo("owner", "admin"), clearSession);
router.delete("/:id", protect, restrictTo("owner", "admin"), remove);

export default router;