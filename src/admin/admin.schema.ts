import mongoose, { model, Schema } from "mongoose";
import { IAdmin } from "./admin.interface";
const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "moderator", "superadmin"],
      default: "admin",
    },

    // permissions: {
    //   type: [String],
    //   default: [],
    // },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Admin = model<IAdmin>("Admin", adminSchema);