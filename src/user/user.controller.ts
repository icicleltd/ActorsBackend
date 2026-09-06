import { NextFunction, Request, Response } from "express";
import catchAsync from "../shared/catchAsync";
import * as UserServices from "./user.service";
import sendResponse from "../shared/sendResponse";

export const makeUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.makeUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result,
    });
  },
);
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.login(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User Login  successfully",
      data: result,
    });
  },
);
