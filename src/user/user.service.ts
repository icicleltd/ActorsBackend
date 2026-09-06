import { Secret } from "jsonwebtoken";
import { TokenPayload } from "../auth/auth.interface";
import { jwtHelper } from "../helper/jwtHelper";
import { AppError } from "../middleware/error";
import { USER_ROLES, UserRole } from "./user.interface";
import { User } from "./user.schema";

interface IMakeUserPayload {
  email: string;
  password: string;
  role: UserRole;
}
interface ILoginPayload {
  identifier: string;
  password: string;
  role: UserRole;
}

export const makeUser = async (payload: IMakeUserPayload) => {
  const { email, password, role } = payload;
  if (!email) throw new AppError(400, "Email is required");
  if (!password) throw new AppError(400, "Password is required");
  if (!USER_ROLES.includes(role))
    throw new AppError(400, "Role not match in User Role");

  const existing = await User.findOne({ email }).lean();
  if (existing) throw new AppError(400, "This user already exist");

  const newUser = await User.create({
    email,
    password,
    role,
  });
  newUser.password = undefined;
  if (!newUser) throw new AppError(500, "Failed to created User");
  return newUser;
};

export const login = async (payload: ILoginPayload) => {
  const { identifier, password } = payload;
  if (!identifier) throw new AppError(400, "Identifier is required");
  if (!password) throw new AppError(400, "Password is required");
  const existingUser = await User.findOne({ email:identifier.trim(), isActive: true }).select(
    "email password role",
  );
  if (!existingUser) {
    throw new AppError(401, "Unauthorized");
  }
  const matchPassword = await existingUser?.comparePassword(password);
  if (!matchPassword) throw new AppError(400, "Incorrect Password!");

  const data: TokenPayload = {
    _id: existingUser._id,
    email: existingUser.email,
    role: existingUser.role,
    fullName: "unknown",
  };
  const accessToken = await jwtHelper.generateToken(
    data,
    process.env.ACCESS_TOKEN_SECRET_KEY as Secret,
    process.env.ACCESS_TOKEN_EXPIRE_IN as string,
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
