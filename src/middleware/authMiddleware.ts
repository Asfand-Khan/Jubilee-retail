import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { AuthRequest } from "../types/types";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const authHeader = req.headers.authorization;
// console.log("Authorization header:", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: 0,
      message: "Unauthorized users can not access this resource",
      payload: [],
    });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    //   user_id: number;
    // };
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ["HS256"], // enforce algorithm
      issuer: process.env.JWT_ISSUER, // expected issuer
      audience: process.env.JWT_AUDIENCE, // expected audience
    }) as { user_id: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
    });
    // console.log("✅ JWT decoded:", decoded);
    // console.log("✅ Authenticated user from DB:", user);
    req.userRecord = user; // Attach user to the request object for later use
    next();
  } catch (error) {
    res.status(401).json({
      status: 0,
      message: "Invalid or expired token",
      payload: [],
    });
  }
};

export const authenticateApiUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const apiKey = req.headers["x-api-key"] as string;
  const apiPassword = req.headers["x-api-password"] as string;

  console.log("Headers received:", req.headers);
  console.log("API Key:", apiKey);
  console.log("API Password:", apiPassword);
  if (!apiKey || !apiPassword) {
    return res.status(401).json({
      status: 0,
      message: "Unauthorized users can not access this resource",
      payload: [],
    });
  }

  try {
    const user = await prisma.apiUser.findUnique({
      where: { api_key: apiKey },
      include: { user: true },
    });

    if (!user || user.api_password !== apiPassword) {
      throw new Error("Invalid API user credentials");
    }

    req.userRecord = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 0,
      message: "Invalid or expired token",
      payload: [],
    });
  }
};

export const checkUserRights =
  (
    menuId: number,
    requiredPermission: "can_view" | "can_create" | "can_edit" | "can_delete",
  ): RequestHandler =>
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const user = req.userRecord;

      if (!user) {
        return res.status(401).json({
          status: 0,
          message: "Unauthorized access",
          payload: [],
        });
      }

      const userMenuRights = await prisma.$queryRaw<
        {
          menu_id: number;
          can_view: boolean;
          can_create: boolean;
          can_edit: boolean;
          can_delete: boolean;
        }[]
      >`SELECT menu_id, can_view, can_create, can_edit, can_delete FROM UserMenuRight WHERE user_id = ${user.id} AND menu_id = ${menuId}`;

      if (!userMenuRights || userMenuRights.length === 0) {
        return res.status(403).json({
          status: 0,
          message: "Access denied",
          payload: [],
        });
      }

      const rights = userMenuRights[0];
      const hasPermission = rights[requiredPermission];

      if (!hasPermission) {
        return res.status(403).json({
          status: 0,
          message: "Insufficient permissions",
          payload: [],
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error,
        payload: [],
      });
    }
  };
