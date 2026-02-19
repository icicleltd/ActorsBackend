"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const error_1 = require("../middleware/error");
const notification_schema_1 = require("./notification.schema");
const beAMember_schema_1 = __importDefault(require("../beAMember/beAMember.schema"));
const detectTarget_1 = require("./hepler/detectTarget");
const db_1 = require("../db");
const createNotification = async () => {
    return {
        msg: "Notification created",
    };
};
const BE_A_MEMBER_TYPES = [
    "BE_A_MEMBER",
    "PAYMENT_SUBMITTED",
    // "APPLICATION_APPROVED",
    // "APPLICATION_REJECTED",
    "CONTACT",
    // "SCHEDULE",
];
const MEMBER_TYPES = [
    // "BE_A_MEMBER",
    // "PAYMENT_SUBMITTED",
    // "APPLICATION_APPROVED",
    // "APPLICATION_REJECTED",
    "REFERENCE_REQUEST",
    "SCHEDULE",
    "NOTIFY_PAYMENT",
];
const getNotification = async (queryPayload) => {
    const { role, recipient, notificationType, limit, search, skip, sortBy, sortWith, } = queryPayload;
    if (!role) {
        throw new error_1.AppError(400, "Role is required");
    }
    const filter = {};
    if (role === "member") {
        if (!recipient) {
            throw new error_1.AppError(400, "Recipient is required");
        }
        const notifications = await notification_schema_1.Notification.aggregate([
            // 1️⃣ Only notifications for this actor
            {
                $match: {
                    recipient: new mongoose_1.default.Types.ObjectId(recipient),
                    type: "REFERENCE_REQUEST",
                },
            },
            // 2️⃣ Join application
            {
                $lookup: {
                    from: "beamembers",
                    localField: "application",
                    foreignField: "_id",
                    as: "application",
                },
            },
            { $unwind: "$application" },
            // 3️⃣ Extract ONLY my reference
            {
                $addFields: {
                    myReference: {
                        $first: {
                            $filter: {
                                input: "$application.actorReference",
                                as: "ref",
                                cond: {
                                    $eq: [
                                        "$$ref.actorId",
                                        new mongoose_1.default.Types.ObjectId(recipient),
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            // 4️⃣ Shape response
            {
                $project: {
                    title: 1,
                    message: 1,
                    type: 1,
                    isRead: 1,
                    createdAt: 1,
                    "application._id": 1,
                    "application.fullName": 1,
                    "application.phoneNumber": 1,
                    "application.email": 1,
                    "application.actorReference.actorId": 1,
                    myReferenceStatus: "$myReference.status",
                    respondedAt: "$myReference.respondedAt",
                },
            },
            // 5️⃣ Sorting & pagination
            { $sort: { [sortBy]: sortWith } },
            { $skip: skip },
            { $limit: limit },
        ]);
        const totalPages = Math.ceil(notifications.length / limit);
        return { notifications, totalPages };
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
        .populate({
        path: "recipient",
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
const allNo = async () => {
    const result = await notification_schema_1.Notification.find();
    return result;
};
const readNotification = async (notificationType, recipient, applicantId, role, id) => {
    // if (!id) {
    //   throw new AppError(400, "Notification id is required");
    // }
    // if (id !== _id) {
    //   throw new AppError(400, "Notification id not match");
    // }
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
    if (role === "member") {
        const session = await mongoose_1.default.startSession();
        let notification;
        await session.withTransaction(async () => {
            // 1️⃣ Mark notification as read
            notification = await notification_schema_1.Notification.findOneAndUpdate({
                application: new mongoose_1.Types.ObjectId(applicantId),
                recipient: new mongoose_1.Types.ObjectId(recipient),
                type: notificationType,
            }, { $set: { isRead: true } }, {
                new: true,
                session,
            });
            if (!notification) {
                throw new error_1.AppError(404, "Notification not found");
            }
            // 2️⃣ Update actorReference read flag
            const beAMember = await beAMember_schema_1.default.findByIdAndUpdate(applicantId, {
                $set: {
                    "actorReference.$[elem].isMemberRead": true,
                },
            }, {
                new: true,
                session,
                arrayFilters: [
                    { "elem.actorId": new mongoose_1.Types.ObjectId(recipient) }, // ✅ FIXED
                ],
            });
            if (!beAMember) {
                throw new error_1.AppError(404, "Be A Member application not found");
            }
        });
        session.endSession();
        return notification;
    }
    if (role && role !== "member") {
        const session = await mongoose_1.default.startSession();
        let notification;
        await session.withTransaction(async () => {
            notification = await notification_schema_1.Notification.updateMany({
                application: new mongoose_1.Types.ObjectId(applicantId),
                type: { $in: BE_A_MEMBER_TYPES },
            }, { $set: { isRead: true } }, {
                session,
            });
            if (!notification) {
                throw new error_1.AppError(404, "Notificationnnn not found");
            }
            // update be a member isAdmin
            const beAMember = await beAMember_schema_1.default.findByIdAndUpdate(applicantId, {
                $set: { isAdminRead: true },
            }, { new: true, session });
            if (!beAMember) {
                throw new error_1.AppError(404, "Be A Member application not found");
            }
        });
        session.endSession();
        return notification;
        // const notifications = await Notification.findOneAndUpdate(
        //   {
        //     application: new Types.ObjectId(applicantId),
        //     type: { $in: BE_A_MEMBER_TYPES },
        //   },
        //   { $set: { isRead: true } },
        //   {
        //     new: true,
        //   },
        // );
        // const beAMembers = await BeAMember.findByIdAndUpdate(
        //   applicantId,
        //   {
        //     $set: { isAdminRead: true },
        //   },
        //   { new: true },
        // );
    }
    // RULE 2: Member reading REFERENCE_REQUEST
    // DEFAULT: single notification read
    const notification = await notification_schema_1.Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) {
        throw new error_1.AppError(404, "Notification not found");
    }
    return notification;
};
const unReadCountNotification = async (queryPayload) => {
    const { role, recipient, _id } = queryPayload;
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
const unReadNotification = async (queryPayload) => {
    const { role, recipient, _id } = queryPayload;
    if (!role) {
        throw new error_1.AppError(400, "Role is required");
    }
    await (0, db_1.connectDB)();
    if (role === "member") {
        if (!recipient) {
            throw new error_1.AppError(400, "recipient id is required");
        }
        if (!recipient.equals(_id)) {
            throw new error_1.AppError(400, "recipient id not match");
        }
        const member = await notification_schema_1.Notification.find({
            type: { $in: MEMBER_TYPES },
            recipient: recipient,
            recipientRole: role,
            isRead: false,
        }).sort({ createdAt: -1 });
        const referenceCount = member.length;
        // const memberUnRead = referenceCount + payment;
        return { notifications: member, referenceCount };
    }
    const [all, contact, reference, payment, approved, beMember, admin] = await Promise.all([
        notification_schema_1.Notification.find({
            isRead: false,
        }),
        notification_schema_1.Notification.countDocuments({
            type: "CONTACT",
            isRead: false,
        }),
        notification_schema_1.Notification.find({
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
        notification_schema_1.Notification.find({
            type: { $in: BE_A_MEMBER_TYPES },
            isRead: false,
        }).sort({ createdAt: -1 }),
    ]);
    const newMemberCount = beMember + approved;
    const adminUnRead = beMember + payment + contact;
    return {
        // ALL: all,
        BE_A_MEMBER: beMember,
        notifications: admin,
        adminUnRead: adminUnRead,
        // payment,
        // contact,
        PAYMENT_SUBMITTED: payment,
        // REFERENCE_REQUEST: reference,
        // APPLICATION_APPROVED: approved,
        CONTACT: contact,
    };
};
const read = async (role, recipient, schedule, contact, notifyPayment, payment, application, isRead, notificationId, type) => {
    if (!notificationId) {
        throw new error_1.AppError(400, "Notification id not found");
    }
    if (!role) {
        throw new error_1.AppError(400, "Role is not found");
    }
    const target = (0, detectTarget_1.getTarget)({ schedule, application, contact, payment, notifyPayment });
    if (!target) {
        throw new error_1.AppError(400, "No valid notification reference found");
    }
    const config = detectTarget_1.MODEL_MAP[target.key];
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            // 1️⃣ Update notification
            const notification = await notification_schema_1.Notification.findOneAndUpdate({
                _id: notificationId,
                recipient,
                type,
                isRead: false,
            }, { $set: { isRead: true } }, { new: true, session });
            if (!notification) {
                throw new error_1.AppError(404, "Notification not found");
            }
            // 2️⃣ Resolve entity update
            let updateConfig;
            if (config.resolveUpdate) {
                updateConfig = config.resolveUpdate({ type, role, recipient });
                if (!updateConfig) {
                    throw new error_1.AppError(400, "Invalid notification type for application");
                }
            }
            else {
                updateConfig = { update: config.defaultUpdate };
            }
            // 3️⃣ Update related entity
            const updated = await config.model.findByIdAndUpdate(target.id, { $set: updateConfig.update }, {
                new: true,
                session,
                ...(updateConfig.arrayFilters && {
                    arrayFilters: updateConfig.arrayFilters,
                }),
            });
            if (!updated) {
                throw new error_1.AppError(404, `${target.key} not updated`);
            }
        });
    }
    catch (error) {
        throw new error_1.AppError(500, error.message || "Transaction failed");
    }
    finally {
        session.endSession();
    }
};
exports.NotificationService = {
    createNotification,
    getNotification,
    getAdminNotification,
    readNotification,
    unReadCountNotification,
    unReadNotification,
    allNo,
    read,
};
