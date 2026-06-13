import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { create } from "../controllers/category.controller";

const router = Router();

router.post("/", protect, create);

export default router;