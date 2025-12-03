import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { NotificationService } from "./notification.services";

const createNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotificationService.createNotification();

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Notification created successfully",
      data: result,
    });
  }
);

const getNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotificationService.getNotification();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notification fetched successfully",
      data: result,
    });
  }
);
const getAdminNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.id;
    const result = await NotificationService.getAdminNotification(adminId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notification fetched successfully",
      data: result,
    });
  }
);
const readNotificaton = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const notificatinId = req.params.id;
    const result = await NotificationService.readNotification(notificatinId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "updated successfully",
      data: result,
    });
  }
);

export const NotificationController = {
  createNotification,
  getNotification,
  getAdminNotification,
  readNotificaton,
};
