import { Router } from "express";

import { getMenu } from "../controllers/public.controller";

const router = Router();

router.get(
  "/menu/:tableCode",
  getMenu
);

export default router;