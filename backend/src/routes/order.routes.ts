import { Router } from "express";

import { create, getByRestaurant, getOne , updateStatus} from "../controllers/order.controller";

const router = Router();

router.post("/", create);
router.get("/restaurant/:restaurantId", getByRestaurant);
router.get("/:id", getOne);
router.patch("/:id/status", updateStatus);


export default router;