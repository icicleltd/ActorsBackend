"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const error_1 = require("../middleware/error");
const notification_schema_1 = __importDefault(require("./notification.schema"));
const createNotification = async () => {
    return {
        msg: "Notification created",
    };
};
const getNotification = async () => {
    const notification = await notification_schema_1.default.find({});
    if (!notification) {
        throw new error_1.AppError(204, "not found");
    }
    return notification;
};
const getAdminNotification = async (adminId) => {
    if (!adminId) {
        throw new error_1.AppError(400, "No admin id provided");
    }
    const notification = await notification_schema_1.default.find({
        recipientId: adminId,
    });
    if (!notification) {
        throw new error_1.AppError(404, "No notifications found for this admin");
    }
    return notification;
};
const readNotification = async (notificatinId) => {
    if (!notificatinId) {
        throw new error_1.AppError(400, "No notification id provided");
    }
    const notification = await notification_schema_1.default.findByIdAndUpdate(notificatinId, {
        isRead: true,
    }, { new: true });
    if (!notification) {
        throw new error_1.AppError(404, "Notification not found");
    }
    return notification;
};
exports.NotificationService = {
    createNotification,
    getNotification,
    getAdminNotification,
    readNotification,
};
