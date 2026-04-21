import { Secret } from "jsonwebtoken";
import Actor from "../actor/actor.schema";
import { jwtHelper } from "../helper/jwtHelper";
import { AppError } from "../middleware/error";
import { DecodedToken, IPayload, TokenPayload } from "./auth.interface";
import { Admin } from "../admin/admin.schema";
import { requiredString } from "../hepler/requiredName";
import { ActorOTP } from "./otp.schema";
import { otpEmailTemplate } from "../helper/mailTempate/sentOTP";
import { sendMail } from "../helper/emailHelper";

const createAuth = async (payload: IPayload, otp: string) => {
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
    // [field]: trimmedIdentifier,
    [field]: { $regex: trimmedIdentifier, $options: "i" },
  }));
  filter.isActive = true;
  const existingUser = await Actor.findOne(filter)
    .select("+password _id email fullName isCreatePassword")
    .lean(false);
  if (!existingUser) {
    throw new AppError(401, "Unauthorized");
  }
  if (!existingUser.isCreatePassword && !otp) {
    throw new AppError(
      400,
      "Your don't have a password yet. Please login with 'First time login' and  create a password first.",
    );
  }
  let isMatchingOTP = null;
  let isPasswordValid = null;
  if (otp) {
    isMatchingOTP = await ActorOTP.findOne({
      actor: existingUser._id,
      otp,
    }).lean();
    if (otp && !isMatchingOTP) {
      throw new AppError(401, "Invalid OTP");
    }
  } else {
    isPasswordValid = await existingUser.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid Password");
    }
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
    process.env.ACCESS_TOKEN_EXPIRE_IN as string,
  );
  if (!accessToken) {
    throw new AppError(400, "Token not found");
  }
  await ActorOTP.deleteOne({ actor: existingUser._id });
  const userResponse = existingUser.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    accessToken,
  };
};

const getAuths = async (payload: any) => {
  const { _id, email, fullName, role } = payload.data;
  if (!_id) {
    throw new AppError(401, "Unathorize");
  }
  const [user, admin] = await Promise.all([
    Actor.findById(_id),
    Admin.findById(_id),
  ]);

  if (!user && !admin) {
    throw new AppError(404, "Not found");
  }
  let accessToken = payload.accessToken;
  if (user && user?.role !== role) {
    const data: TokenPayload = {
      _id: user._id,
      email: user.email,
      role: user?.role,
      fullName: user.fullName,
    };
    accessToken = await jwtHelper.generateToken(
      data,
      process.env.ACCESS_TOKEN_SECRET_KEY as Secret,
      process.env.ACCESS_TOKEN_EXPIRE_IN as string,
    );
    if (!accessToken) {
      throw new AppError(400, "Token not found");
    }
  }
  return { user, admin, accessToken };
};

const getAdminAuths = async (adminId: string) => {
  return;
};

const readAuth = async (authId: string) => {
  return;
};

const createOTP = async (idNo: string, email: string) => {
  requiredString(idNo, "Actor ID");
  // requiredString(email, "Email");
  const existsActor = await Actor.findOne({
    idNo: { $regex: `^${idNo.trim()}$`, $options: "i" },
  })
    .select("_id fullName email")
    .lean();
    console.log(existsActor)
  if (!existsActor) {
    throw new AppError(404, "Actor not found");
  }
  const existsOTP = await ActorOTP.findOne({ actor: existsActor._id }).lean();
  if (existsOTP) {
    throw new AppError(
      409,
      `OTP already exists for this actor.Check this ${existsActor.email} or wait until it expires at ${existsOTP.expiresAt.toLocaleString()}`,
    );
  }
  // if (existsOTP) {
  //   await ActorOTP.findByIdAndDelete(existsActor._id);
  // }
  const generateOpt = Math.floor(100000 + Math.random() * 900000).toString();
  const saveOTP = await ActorOTP.create({
    actor: existsActor._id,
    otp: generateOpt,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });
  if (!saveOTP) {
    throw new AppError(500, "Failed to create OTP. Please try again.");
  }

  const { subject, text, html } = otpEmailTemplate(
    existsActor.fullName,
    generateOpt,
    saveOTP.expiresAt,
  );

  await sendMail({ to: existsActor.email!, subject, text, html });
  // console.log(saveOTP)
  // console.log(existsOTP);

  // console.log(existsActor);
  return existsActor;
};
const updatePassword = async (idNo: string, newPassword: string) => {
  requiredString(idNo, "Actor ID");
  requiredString(newPassword, "New Password");
  const existingUser = await Actor.findOne({
    idNo: { $regex: `^${idNo.trim()}$`, $options: "i" },
  })
    .select("+password _id email fullName")
    .lean(false);
  if (!existingUser) {
    throw new AppError(404, "Actor not found");
  }
  existingUser.password = newPassword;
  existingUser.isCreatePassword = true;
  await existingUser.save();
  return;
};

export const AuthService = {
  createAuth,
  getAuths,
  getAdminAuths,
  readAuth,
  createOTP,
  updatePassword,
};
