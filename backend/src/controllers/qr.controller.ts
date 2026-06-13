import { Request, Response } from "express";
import { generateTableQR } from "../services/qr.service";

export const generate = async (
  req: Request<{ tableId: string }>,
  res: Response
) => {
  try {
    const qr = await generateTableQR(
      req.params.tableId
    );

    return res.status(200).json({
      success: true,
      message: "QR generated successfully",
      data: qr,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};