import { Types } from "mongoose";

export interface IPayload {
  identifier: string;
  password: string;
   role: string;
}

export interface TokenPayload {
  _id: string | Types.ObjectId;
  fullName: string;
  role: string;
  email?: string;
  // idNo: string;
}
export interface DecodedToken {
  _id: string | Types.ObjectId;
  fullName: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
