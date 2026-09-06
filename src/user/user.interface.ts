import { Document } from "mongoose";

export const USER_ROLES = ["user", "admin", "account", "superadmin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  email: string;
  password?: string;
  comparePassword(plainPassword: string): Promise<boolean>;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserDocument = IUser & Document;
