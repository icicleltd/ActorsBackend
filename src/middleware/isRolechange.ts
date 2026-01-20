import { NextFunction, Request, Response } from "express";
import { jwtHelper } from "../helper/jwtHelper";
import { Secret } from "jsonwebtoken";
import { AppError } from "./error";

export const isRoleChange = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Guest access allowed
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Unauthorized");
    }

    const accessToken = authHeader.split(" ")[1];
    const data = jwtHelper.verifyToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_KEY as Secret
    );

    req.user = data; // attach user if valid
    return next();
  } catch (error) {
    console.warn("Token invalid or expired, continuing as guest");
    return next(error);
  }
};
