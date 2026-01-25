"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const notification_services_1 = require("./notification.services");
const error_1 = require("../middleware/error");
const mongoose_1 = require("mongoose");
const qureyCheck_1 = require("../helper/qureyCheck");
const notification_constant_1 = require("./notification.constant");
const createNotification = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await notification_services_1.NotificationService.createNotification();
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Notification created successfully",
        data: result,
    });
});
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
const getNotification = (0, catchAsync_1.default)(async (req, res, next) => {
    const { recipient, notificationType } = req.query;
    const role = req.user.data.role;
    const search = req.query.search;
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 1;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortWith = req.query.sortWith === "asc" ? 1 : -1;
    if (notificationType &&
        !(0, qureyCheck_1.isValidEnumValue)(notificationType, notification_constant_1.NOTIFICATION_TYPES)) {
        throw new error_1.AppError(400, "Invalid notificationType");
    }
    let validatedNotificationType;
    if (notificationType !== undefined) {
        if (!(0, qureyCheck_1.isValidEnumValue)(notificationType, notification_constant_1.NOTIFICATION_TYPES)) {
            throw new error_1.AppError(400, "Invalid notificationType");
        }
        validatedNotificationType = notificationType;
    }
    const result = await notification_services_1.NotificationService.getNotification({
        role,
        recipient: recipient
            ? new mongoose_1.Types.ObjectId(recipient)
            : undefined,
        notificationType: validatedNotificationType,
        page,
        limit,
        skip,
        sortBy,
        sortWith,
        search,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notifications fetched successfully",
        data: result,
    });
});
const getAdminNotification = (0, catchAsync_1.default)(async (req, res, next) => {
    const adminId = req.params.id;
    const result = await notification_services_1.NotificationService.getAdminNotification(adminId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notification fetched successfully",
        data: result,
    });
});
const readNotificaton = (0, catchAsync_1.default)(async (req, res, next) => {
    const role = req.user.data.role;
    const { notificationType, _id } = req.body;
    console.log(req.body);
    const result = await notification_services_1.NotificationService.readNotification(notificationType, _id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "updated successfully",
        data: result,
    });
});
const unReadCountNotification = (0, catchAsync_1.default)(async (req, res, next) => {
    const { recipient } = req.query;
    const role = req.user.data.role;
    const result = await notification_services_1.NotificationService.unReadCountNotification({
        role,
        recipient: recipient
            ? new mongoose_1.Types.ObjectId(recipient)
            : undefined,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notification get count successfully",
        data: result,
    });
});
exports.NotificationController = {
    createNotification,
    getNotification,
    getAdminNotification,
    readNotificaton,
    unReadCountNotification,
};
