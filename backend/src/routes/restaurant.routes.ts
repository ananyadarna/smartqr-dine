import { Router } from "express";

import { protect } from "../middlewares/auth.middleware";

import { create, getAll, getOne, update} from "../controllers/restaurant.controller";

const router = Router();

router.post("/",protect,create);
router.get("/",protect,getAll);
router.get("/:id",protect,getOne);
router.patch("/:id",protect,update);

export default router;