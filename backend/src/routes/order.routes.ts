import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { create, getByRestaurant, getOne, updateStatus, getByTable, getBySession } from "../controllers/order.controller";

const router = Router();

router.post("/", create);
router.get("/restaurant/:restaurantId", protect, restrictTo("owner", "admin", "chef", "waiter"), getByRestaurant);
router.get("/table/:tableId", getByTable);
router.get("/session/:tableSessionId", getBySession);
router.get("/:id", getOne);
router.patch("/:id/status", protect, restrictTo("owner", "admin", "chef", "waiter"), updateStatus);

export default router;