import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { AdminService } from "./admin.services";
import { callbackify } from "util";
import { PayloadLoign } from "./admin.interface";

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
    const file = req.file;
    const actorId = req.params.id;
    const result = await AdminService.updateActorProfile(data, actorId, file);
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
const promoteMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = await AdminService.promoteMember(data);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Actor Promoted successfully",
      data: result,
    });
  }
);
const deleteMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await AdminService.deleteMember(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Actor deleted successfully",
      data: result,
    });
  }
);
const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: PayloadLoign = req.body;
    const result = await AdminService.login(payload);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Actor Promoted successfully",
      data: result,
    });
  }
);
const test = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.test();
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Actor Promoted successfully",
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
  promoteMember,
  test,
  deleteMember,
  login
};
