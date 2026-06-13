import { Request, Response } from "express";

import { registerSchema } from "../validators/auth.validator";

import { registerUser } from "../services/auth.service";

import { loginSchema } from "../validators/auth.validator";

import { loginUser } from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      registerSchema.parse(req.body);

    const result =
      await registerUser(data);

    return res.status(201).json({
      success: true,
      message: "User registered",
      data: result,
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

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      loginSchema.parse(req.body);

    const result =
      await loginUser(data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
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