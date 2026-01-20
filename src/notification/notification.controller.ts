import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { NotificationService } from "./notification.services";
import { AppError } from "../middleware/error";
import { Types } from "mongoose";
import { isValidEnumValue } from "../helper/qureyCheck";
import { NOTIFICATION_TYPES, RECIPIENT_ROLES } from "./notification.constant";
import { NotificationType } from "./notification.interface";

const createNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotificationService.createNotification();

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Notification created successfully",
      data: result,
    });
  },
);

// const getNotification = catchAsync(async (req: Request, res: Response) => {
//   const { recipient, recipientRole, notificationType } = req.query;

//   // ✅ Validate recipientRole
//   if (!isValidEnumValue(recipientRole, RECIPIENT_ROLES)) {
//     throw new AppError(400, "Invalid recipientRole");
//   }

//   // ✅ Validate notificationType (OPTIONAL filter)
//   if (
//     notificationType &&
//     !isValidEnumValue(notificationType, NOTIFICATION_TYPES)
//   ) {
//     throw new AppError(400, "Invalid notificationType");
//   }

//   const queryPayload: INotificationQuery = {
//     recipientRole,
//     recipient: recipient ? new Types.ObjectId(recipient as string) : undefined,
//     notificationType: notificationType as Notification_Type | undefined,
//   };

//   const result = await NotificationService.getNotification(queryPayload);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Notification fetched successfully",
//     data: result,
//   });
// });

const getNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { recipient, recipientRole, notificationType } = req.query;

    if (!isValidEnumValue(recipientRole, RECIPIENT_ROLES)) {
      throw new AppError(400, "Invalid recipientRole");
    }

    if (
      notificationType &&
      !isValidEnumValue(notificationType, NOTIFICATION_TYPES)
    ) {
      throw new AppError(400, "Invalid notificationType");
    }
    let validatedNotificationType: NotificationType | undefined;

    if (notificationType !== undefined) {
      if (!isValidEnumValue(notificationType, NOTIFICATION_TYPES)) {
        throw new AppError(400, "Invalid notificationType");
      }
      validatedNotificationType = notificationType;
    }
    const result = await NotificationService.getNotification({
      recipientRole,
      recipient: recipient
        ? new Types.ObjectId(recipient as string)
        : undefined,
      notificationType: validatedNotificationType,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notifications fetched successfully",
      data: result,
    });
  },
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
  },
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
  },
);

export const NotificationController = {
  createNotification,
  getNotification,
  getAdminNotification,
  readNotificaton,
};
