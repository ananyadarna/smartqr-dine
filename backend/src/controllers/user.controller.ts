import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { createStaffSchema } from "../validators/user.validator";

// Create a new staff user (chef or waiter) under the owner's restaurant
export const createStaffUser = async (req: Request, res: Response) => {
  try {
    const owner = (req as any).user;
    if (!owner.restaurantId) {
      return res.status(400).json({
        success: false,
        error: "Your account is not linked to any restaurant. Please onboard first.",
      });
    }

    const { name, email, password, role } = createStaffSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      restaurantId: owner.restaurantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        role: staff.role,
        restaurantId: staff.restaurantId?.toString(),
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Retrieve all staff members for the owner's restaurant
export const getRestaurantStaff = async (req: Request, res: Response) => {
  try {
    const owner = (req as any).user;
    if (!owner.restaurantId) {
      return res.status(400).json({
        success: false,
        error: "Your account is not linked to any restaurant.",
      });
    }

    // List all users for this restaurantId, except the owner themself
    const staffList = await User.find({
      restaurantId: owner.restaurantId,
      _id: { $ne: owner._id },
    }).select("-password");

    return res.status(200).json({
      success: true,
      data: staffList.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        role: s.role,
        isActive: s.isActive,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Delete a staff member
export const deleteStaffUser = async (req: Request, res: Response) => {
  try {
    const owner = (req as any).user;
    if (!owner.restaurantId) {
      return res.status(400).json({
        success: false,
        error: "Your account is not linked to any restaurant.",
      });
    }

    const deletedStaff = await User.findOneAndDelete({
      _id: req.params.id,
      restaurantId: owner.restaurantId, // Ensure they belong to the same restaurant
    });

    if (!deletedStaff) {
      return res.status(404).json({
        success: false,
        error: "Staff member not found or does not belong to your restaurant.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
