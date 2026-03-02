import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { AuthService } from "./auth.services";
import { IPayload } from "./auth.interface";
import setCookie from "../helper/cookieHelper";

const createAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: IPayload = req.body;
    const otp =req.query.otp as string;
    const result = await AuthService.createAuth(payload,otp);
    setCookie(
      res,
      "accessToken",
      result.accessToken,
      Number(process.env.ACCESS_COOKIE_EXPIRE_IN)
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Auth created successfully",
      data: result,
    });
  }
);

const getAuths = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const user = req.user;
 
    const result = await AuthService.getAuths(user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Auths fetched successfully",
      data: result,
    });
  }
);

const getAdminAuths = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.id;
    const result = await AuthService.getAdminAuths(adminId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin auths fetched successfully",
      data: result,
    });
  }
);

const readAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authId = req.params.id;
    const result = await AuthService.readAuth(authId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Auth updated successfully",
      data: result,
    });
  }
);
const createOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {idNo,email} = req.body;
    const result = await AuthService.createOTP(idNo,email);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Otp Created successfully. Please check your email",
      data: result,
    });
  }
);
const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {idNo,newPassword} = req.body;
    const result = await AuthService.updatePassword(idNo,newPassword);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password updated successfully",
      data: result,
    });
  }
);

export const AuthController = {
  createAuth,
  getAuths,
  getAdminAuths,
  readAuth,
  createOTP,
  updatePassword,
};
