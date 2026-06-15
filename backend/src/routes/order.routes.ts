import { Router } from "express";

import { create, getByRestaurant, getOne, updateStatus, getByTable } from "../controllers/order.controller";

const router = Router();

router.post("/", create);
router.get("/restaurant/:restaurantId", getByRestaurant);
router.get("/table/:tableId", getByTable);
router.get("/:id", getOne);
router.patch("/:id/status", updateStatus);


export default router;