import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import jwt from "jsonwebtoken";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip;
  const userAgent = req.headers["user-agent"] || "Unknown";
  let userId = "NoAuth";

  // Decode JWT if present in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    // try {
    //     const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    //     userId = `UserID: ${decoded.id}`; // Adjust to fit your JWT structure
    // } catch (err) {
    //     userId = 'InvalidToken';
    // }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string, {
        algorithms: ["HS256"],
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      });
      userId = `UserID: ${decoded.id}`; // Adjust to fit your JWT structure
    } catch (err) {
      userId = "InvalidToken";
    }
  }

  logger.info(
    `Request from IP: ${ip}, ${userId}, User-Agent: ${userAgent}, Method: ${req.method}, URL: ${req.originalUrl}`,
  );
  next();
};
