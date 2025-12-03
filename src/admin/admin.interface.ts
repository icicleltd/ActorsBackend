import { Document, Types } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "moderator" | "superadmin";
  // permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}