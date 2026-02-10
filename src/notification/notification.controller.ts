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
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { recipient, notificationType } = req.query;
    const role = req.user.data.role;
    const search = req.query.search as string;

    const limit = parseInt(req.query?.limit as string) || 10;
    const page = parseInt(req.query?.page as string) || 1;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortWith: 1 | -1 = req.query.sortWith === "asc" ? 1 : -1;

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
      role,
      recipient: recipient
        ? new Types.ObjectId(recipient as string)
        : undefined,
      notificationType: validatedNotificationType,
      page,
      limit,
      skip,
      sortBy,
      sortWith,
      search,
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
const readNotification = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const role = req.user.data.role;
    const id = req.user.data._id;
    const { notificationType, recipient, applicantId } = req.body;
    const result = await NotificationService.readNotification(
      notificationType,
      recipient,
      applicantId,
      role,
      id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "updated successfully",
      data: result,
    });
  },
);

const unReadCountNotification = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { recipient } = req.query;
    const role = req.user.data.role;
    const result = await NotificationService.unReadCountNotification({
      role,
      recipient: recipient
        ? new Types.ObjectId(recipient as string)
        : undefined,
      _id: new Types.ObjectId(req.user.data._id as string),
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notification get count successfully",
      data: result,
    });
  },
);
const unReadNotification = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { recipient } = req.query;
    const role = req.user.data.role;
    const result = await NotificationService.unReadNotification({
      role,
      recipient: recipient
        ? new Types.ObjectId(recipient as string)
        : undefined,
      _id: new Types.ObjectId(req.user.data._id as string),
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notification get count successfully",
      data: result,
    });
  },
);
const allNo = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const result = await NotificationService.allNo();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "all get  successfully",
      data: result,
    });
  },
);

const read = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const role = req.user.data.role;
    const id = req.user.data._id;
    const notificationId = req.params.id;
    const {
      type,
      recipient,
      application,
      schedule,
      payment,
      contact,
      isRead,
    } = req.body;
    if (
      role === "member" &&
      !new Types.ObjectId(recipient).equals(new Types.ObjectId(id))
    ) {
      throw new AppError(401, "Unauthorized");
    }
    const result = await NotificationService.read(
      role,
      recipient,
      schedule,
      contact,
      payment,
      application,
      isRead,
      notificationId,
      type,
    );

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
  readNotification,
  unReadCountNotification,
  unReadNotification,
  allNo,
  read,
};
