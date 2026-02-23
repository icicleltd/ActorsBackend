import jwt, { Secret } from "jsonwebtoken";
import { DecodedToken, TokenPayload } from "../auth/auth.interface";
import { AppError } from "../middleware/error";
const generateToken = (
  payload: TokenPayload,
  secret: Secret,
  expiresIn: number | string
): string => {
  try {
    return jwt.sign(payload, secret, {
      algorithm: "HS256",
      expiresIn,
    } as jwt.SignOptions);
  } catch (error) {
    throw new AppError(500, "Failed to generate token");
  }
};

const verifyToken = (token: string, secret: Secret) => {
  try {
    return jwt.verify(token, secret) as DecodedToken;
  } catch (error) {
    throw new AppError(401, "Your token is expired. Please login");
  }
};

export const jwtHelper = { generateToken, verifyToken };
