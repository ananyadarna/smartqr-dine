import { Router } from "express";

import { getMenu, getRestaurantBySubdomain } from "../controllers/public.controller";

const router = Router();

router.get(
  "/menu/:tableCode",
  getMenu
);

router.get(
  "/restaurant/subdomain/:subdomain",
  getRestaurantBySubdomain
);

export default router;