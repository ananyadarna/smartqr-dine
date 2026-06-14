import { Router } from "express";

import { getStats, getRecent, analytics } from "../controllers/dashboard.controller";

const router = Router();

router.get( "/:restaurantId",getStats);
router.get("/:restaurantId/recent-orders", getRecent);
router.get("/:restaurantId/analytics", analytics);

export default router;