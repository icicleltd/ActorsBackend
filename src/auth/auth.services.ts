import { Secret } from "jsonwebtoken";
import Actor from "../actor/actor.schema";
import { jwtHelper } from "../helper/jwtHelper";
import { AppError } from "../middleware/error";
import { DecodedToken, IPayload, TokenPayload } from "./auth.interface";
import { Admin } from "../admin/admin.schema";

const createAuth = async (payload: IPayload) => {
  const { password, identifier, role } = payload;
  const filter: any = {};
  const fields = ["email", "idNo", "phoneNumber"];
  if (!password.trim()) {
    throw new AppError(400, "Password is required");
  }
  if (!identifier.trim()) {
    throw new AppError(400, "Identifier is required");
  }
  if (!role.trim()) {
    throw new AppError(400, "Role is required");
  }
  const trimmedIdentifier = identifier.trim().toLowerCase();
  filter.$or = fields.map((field) => ({
    [field]: trimmedIdentifier,
  }));
  const existingUser = await Actor.findOne(filter)
    .select("+password _id email fullName")
    .lean(false);
  if (!existingUser) {
    throw new AppError(401, "Unauthorized");
  }
  console.log(payload);
  const isPasswordValid = await existingUser.comparePassword(password);
  console.log(isPasswordValid);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid Password");
  }
  const data: TokenPayload = {
    _id: existingUser._id,
    email: existingUser.email,
    role,
    fullName: existingUser.fullName,
  };
  const accessToken = await jwtHelper.generateToken(
    data,
    process.env.ACCESS_TOKEN_SECRET_KEY as Secret,
    process.env.ACCESS_TOKEN_EXPIRE_IN as string
  );
  if (!accessToken) {
    throw new AppError(400, "Token not found");
  }
  const userResponse = existingUser.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    accessToken,
  };
};

const getAuths = async (payload: DecodedToken) => {
  const { _id, email, fullName, role } = payload;
  if (!_id) {
    throw new AppError(401, "Unathorize");
  }
  const [user, admin] = await Promise.all([
    Actor.findById(_id),
    Admin.findById(_id),
  ]);
  console.log(user,admin)
  if (!user && !admin) {
    throw new AppError(404, "Not found");
  }
  return {user , admin};
};

const getAdminAuths = async (adminId: string) => {
  return;
};

const readAuth = async (authId: string) => {
  return;
};

export const AuthService = {
  createAuth,
  getAuths,
  getAdminAuths,
  readAuth,
};
