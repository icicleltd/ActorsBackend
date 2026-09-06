import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IUserDocument, USER_ROLES } from "./user.interface";
const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "admin",
      required: true,
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
  },
);

userSchema.pre<IUserDocument>("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  plainPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.password);
};

export const User = model<IUserDocument>("User", userSchema);
