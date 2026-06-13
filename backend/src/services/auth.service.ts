import bcrypt from "bcryptjs";

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

  const token = generateToken(
    user._id.toString()
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};