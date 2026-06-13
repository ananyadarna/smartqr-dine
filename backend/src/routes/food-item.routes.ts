import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { create, getByCategory, update, remove } from "../controllers/food-item.controller";

const router = Router();

router.post("/", protect, create);
router.get("/category/:categoryId", protect, getByCategory);
router.patch("/:id", protect, update);
router.delete("/:id", protect, remove);

export default router;