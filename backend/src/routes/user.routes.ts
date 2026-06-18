import { Router } from "express";
import { createStaffUser, getRestaurantStaff, deleteStaffUser } from "../controllers/user.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";

const router = Router();

// Protect all routes to only be accessible by authenticated Owners/Admins
router.use(protect);
router.use(restrictTo("owner", "admin"));

router.post("/staff", createStaffUser);
router.get("/staff", getRestaurantStaff);
router.delete("/staff/:id", deleteStaffUser);

export default router;
