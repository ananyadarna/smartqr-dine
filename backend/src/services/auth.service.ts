import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(
    user._id.toString()
  );

  const userResponse = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId ? user.restaurantId.toString() : null,
  };

  return {
    user: userResponse,
    token,
  };
};

export const loginUser = async ({
  email,
  password,
}: LoginInput) => {
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Self-healing: check if user has created a restaurant but restaurantId is not linked
  if (!user.restaurantId) {
    const { Restaurant } = await import("../models/Restaurant");
    const existingRestaurant = await Restaurant.findOne({ createdBy: user._id });
    if (existingRestaurant) {
      user.restaurantId = existingRestaurant._id;
      await user.save();
    }
  }

  const token = generateToken(
    user._id.toString()
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId ? user.restaurantId.toString() : null,
    },
    token,
  };
};

const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginOrRegisterWithGoogle = async (credential: string) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn("WARNING: GOOGLE_CLIENT_ID is not configured in backend environment variables.");
  }

  let payload: any;
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error: any) {
    throw new Error(`Google token verification failed: ${error.message}`);
  }

  if (!payload || !payload.email) {
    throw new Error("Invalid Google token payload");
  }

  const { email, name } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    // Generate a random password since password is required by Schema
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      name: name || "Google User",
      email,
      password: hashedPassword,
    });
  }

  // Self-healing: check if user has created a restaurant but restaurantId is not linked
  if (!user.restaurantId) {
    const { Restaurant } = await import("../models/Restaurant");
    const existingRestaurant = await Restaurant.findOne({ createdBy: user._id });
    if (existingRestaurant) {
      user.restaurantId = existingRestaurant._id;
      await user.save();
    }
  }

  const token = generateToken(user._id.toString());

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId ? user.restaurantId.toString() : null,
    },
    token,
  };
};