import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { AdminService } from "./admin.services";

const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = await AdminService.createAdmin(data);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }
);

const readNotificaton = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.readAdmin();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Not successfully",
      data: result,
    });
  }
);
const updateActorProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const actorId = req.params.id;
    const result = await AdminService.updateActorProfile(data, actorId);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Actor profile filled up successfully",
      data: result,
    });
  }
);
const getAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAdmin();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin fetched successfully",
      data: result,
    });
  }
);
const addActor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const data = req.body;
    const result = await AdminService.addActor(file, data);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Actor added successfully",
      data: result,
    });
  }
);

export const AdminController = {
  createAdmin,
  getAdmin,
  readNotificaton,
  updateActorProfile,
  addActor,
};
