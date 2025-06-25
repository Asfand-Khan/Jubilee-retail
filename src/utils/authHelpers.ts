import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
const expiration = process.env.JWT_EXPIRATION;

if (!secret) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

if (!expiration) {
  throw new Error(
    "JWT_EXPIRATION is not defined in the environment variables."
  );
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user_id: number): string => {
  // @ts-ignore
  return jwt.sign({ user_id }, secret, {
    expiresIn: expiration,
  });
};
