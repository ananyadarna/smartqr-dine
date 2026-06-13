import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { generate } from "../controllers/qr.controller";

const router = Router();

router.post(
  "/generate/:tableId",
  protect,
  generate
);

export default router;