"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const error_1 = require("../middleware/error");
const notification_schema_1 = require("./notification.schema");
const createNotification = async () => {
    return {
        msg: "Notification created",
    };
};
const getNotification = async (queryPayload) => {
    const { recipientRole, recipient, notificationType } = queryPayload;
    const filter = {};
    if (recipientRole === "member") {
        if (!recipient) {
            throw new error_1.AppError(400, "Recipient is required for member notifications");
        }
        filter.recipient = recipient;
    }
    if (recipientRole === "admin" || recipientRole === "superadmin") {
        filter.recipientRole = { $in: ["admin", "superadmin"] };
    }
    if (notificationType && notificationType !== "ALL") {
        filter.type = notificationType;
    }
    const notifications = await notification_schema_1.Notification.find(filter)
        .sort({ createdAt: -1 })
        .lean();
    console.log("notifications", notifications.length);
    return notifications;
};
const getAdminNotification = async (adminId) => {
    if (!adminId) {
        throw new error_1.AppError(400, "No admin id provided");
    }
    const notification = await notification_schema_1.Notification.find({
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
    const notification = await notification_schema_1.Notification.findByIdAndUpdate(notificatinId, {
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
