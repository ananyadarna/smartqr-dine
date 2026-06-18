import { Request, Response } from "express";

import { getMenuByTableCode } from "../services/public.service";

export const getMenu = async (
  req: Request<{ tableCode: string }>,
  res: Response
) => {
  try {
    const menu =
      await getMenuByTableCode(
        req.params.tableCode
      );

    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};