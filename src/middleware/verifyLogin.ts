import { NextFunction, Request, Response } from "express";
import { jwtHelper } from "../helper/jwtHelper";
import { Secret } from "jsonwebtoken";
export const VerifyLogin = async (
  req: Request &{user?:any},
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  console.log("in varify login",authHeader)
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "No token provided",
    });
  }
  const accessToken = authHeader.split(" ")[1];
  console.log(accessToken)
  const data = jwtHelper.verifyToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET_KEY as Secret
  );
  console.log("decode",data)
  const value = {
    data, accessToken
  }
  req.user = value;
  next();
};
