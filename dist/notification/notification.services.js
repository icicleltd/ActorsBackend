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
// const BE_A_MEMBER_TYPES = [
//   "APPLICATION_SUBMITTED",
//   "PAYMENT_SUBMITTED",
//   "APPLICATION_APPROVED",
//   "APPLICATION_REJECTED",
// ];
const getNotification = async (queryPayload) => {
    const { role, recipient, notificationType, limit, search, skip, sortBy, sortWith, } = queryPayload;
    if (!role) {
        throw new error_1.AppError(400, "Role is required");
    }
    const filter = {};
    if (role === "member") {
        if (!recipient) {
            throw new error_1.AppError(400, "Recipient is required for member notifications");
        }
        filter.recipient = recipient;
    }
    // 🔹 Admin / Superadmin inbox
    if (role === "admin" || role === "superadmin") {
        filter.recipientRole = { $in: ["admin", "superadmin"] };
        // 👉 BE_A_MEMBER means group filter
        if (notificationType === "BE_A_MEMBER") {
            // filter.type = { $in: BE_A_MEMBER_TYPES };
            filter.type = notificationType;
        }
        // 👉 Specific single notification
        else if (notificationType && notificationType !== "ALL") {
            filter.type = notificationType;
        }
    }
    const notifications = await notification_schema_1.Notification.find(filter)
        .populate({
        path: "application",
        populate: {
            path: "actorReference.actorId",
            model: "Actor",
        },
    })
        .populate({
        path: "payment",
    })
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortWith })
        .lean();
    const totalPages = Math.ceil(notifications.length / limit);
    return { notifications, totalPages };
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
const readNotification = async (notificationType, id) => {
    if (!id) {
        throw new error_1.AppError(400, "Notification id is required");
    }
    // if (
    //   notificationType === "BE_A_MEMBER" &&
    //   (role === "admin" || role === "superadmin")
    // ) {
    //   await Notification.updateMany(
    //     {
    //       type: "APPLICATION_SUBMITTED",
    //       recipientRole: { $in: ["admin", "superadmin"] },
    //       isRead: false,
    //     },
    //     {
    //       $set: { isRead: true },
    //     },
    //   );
    //   return { success: true, bulkRead: true };
    // }
    // RULE 2: Member reading REFERENCE_REQUEST
    if (notificationType === "REFERENCE_REQUEST") {
        const notification = await notification_schema_1.Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!notification) {
            throw new error_1.AppError(404, "REFERENCE_REQUEST Notification not found");
        }
        return notification;
    }
    // DEFAULT: single notification read
    const notification = await notification_schema_1.Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) {
        throw new error_1.AppError(404, "Notification not found");
    }
    return notification;
};
const unReadCountNotification = async (queryPayload) => {
    const { role, recipient } = queryPayload;
    if (!role) {
        throw new error_1.AppError(400, "Role is required");
    }
    if (role === "member") {
        if (!recipient) {
            throw new error_1.AppError(400, "recipient id is required");
        }
        const referace = await notification_schema_1.Notification.countDocuments({
            type: "REFERENCE_REQUEST",
            recipient: recipient,
            recipientRole: role,
            isRead: false,
        });
        return { REFERENCE_REQUEST: referace };
    }
    const [all, contact, referace, payment, approved, submit] = await Promise.all([
        notification_schema_1.Notification.countDocuments({
            isRead: false,
        }),
        notification_schema_1.Notification.countDocuments({
            type: "CONTACT",
            isRead: false,
        }),
        notification_schema_1.Notification.countDocuments({
            type: "REFERENCE_REQUEST",
            isRead: false,
        }),
        notification_schema_1.Notification.countDocuments({
            type: "PAYMENT_SUBMITTED",
            isRead: false,
        }),
        notification_schema_1.Notification.countDocuments({
            type: "APPLICATION_APPROVED",
            isRead: false,
        }),
        notification_schema_1.Notification.countDocuments({
            type: "BE_A_MEMBER",
            isRead: false,
        }),
    ]);
    const adminNotification = submit + payment + contact;
    return {
        ALL: all,
        BE_A_MEMBER: submit,
        ADMIN_NOTIFICATION: adminNotification,
        PAYMENT_SUBMITTED: payment,
        REFERENCE_REQUEST: referace,
        APPLICATION_APPROVED: approved,
        CONTACT: contact,
    };
};
exports.NotificationService = {
    createNotification,
    getNotification,
    getAdminNotification,
    readNotification,
    unReadCountNotification,
};
