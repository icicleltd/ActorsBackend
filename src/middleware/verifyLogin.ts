import { NextFunction, Request, Response } from "express";
import { jwtHelper } from "../helper/jwtHelper";
import { Secret } from "jsonwebtoken";
export const VerifyLogin = async (
  req: Request &{user?:any},
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      megs: "NO token provided",
    });
  }
  const accessToken = authHeader.split(" ")[1];
  const data = jwtHelper.verifyToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET_KEY as Secret
  );
  req.user = data;
  next();
};
