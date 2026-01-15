import { NextFunction, Request, Response } from "express";
import Actor from "../actor/actor.schema";
import { Admin } from "../admin/admin.schema";
import { AppError } from "./error";

export const VerifyAdmin = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { _id } = user.data;
  const actor = await Actor.findOne({ _id, role: { $in: ["admin"] } });
  const admin = await Admin.findOne({
    _id,
    role: { $in: ["admin", "superadmin", "moderator"] },
    isActive: true,
  });
  if (!actor && !admin) {
    throw new AppError(401, "Unauthorized");
  }
  next();
};
