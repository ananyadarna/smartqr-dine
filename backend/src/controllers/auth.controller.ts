import { Request, Response } from "express";

import { registerSchema, loginSchema, googleAuthSchema } from "../validators/auth.validator";

import { registerUser,  loginUser, loginOrRegisterWithGoogle } from "../services/auth.service";

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

export const getProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId ? user.restaurantId.toString() : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const { credential } =
      googleAuthSchema.parse(req.body);

    const result =
      await loginOrRegisterWithGoogle(credential);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
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