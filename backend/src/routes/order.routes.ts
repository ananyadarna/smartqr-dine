import { Router } from "express";

import { create, getByRestaurant, getOne, updateStatus, getByTable, getBySession } from "../controllers/order.controller";

const router = Router();

router.post("/", create);
router.get("/restaurant/:restaurantId", getByRestaurant);
router.get("/table/:tableId", getByTable);
router.get("/session/:tableSessionId", getBySession);
router.get("/:id", getOne);
router.patch("/:id/status", updateStatus);


export default router;