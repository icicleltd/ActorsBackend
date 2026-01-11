import { Document, Types } from "mongoose";

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "moderator" | "superadmin";
  comparePassword(plainPassword: string): Promise<boolean>;
  permissions?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayloadAdmin {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "moderator" | "superadmin";
}
export interface PayloadLoign {
  identifier: string;
  password: string;
  role: "admin" | "moderator" | "superadmin";
}
