import { Types } from "mongoose";

export interface IPayload {
  identifier: string;
  password: string;
}

export interface TokenPayload {
  _id: string | Types.ObjectId;
  fullName: string;
  role: string;
  email?: string;
  // idNo: string;
}
