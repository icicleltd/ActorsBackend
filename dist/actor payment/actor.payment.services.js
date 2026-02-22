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
exports.ActorPaymentService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const error_1 = require("../middleware/error");
const notification_schema_1 = require("../notification/notification.schema");
const actor_payment_schema_1 = __importStar(require("./actor.payment.schema"));
const actorPaymentInfo = async (id, search, limit, sortBy, sortWith, alive, year, status) => {
    if (!year) {
        throw new error_1.AppError(400, "Year is required");
    }
    const matchFilter = {};
    // Exclude specific actor
    if (id) {
        matchFilter._id = { $nin: [new mongoose_1.Types.ObjectId(id)] };
    }
    // Alive filter
    if (alive?.trim() === "alive") {
        matchFilter["rankHistory.rank"] = { $nin: ["pastWay"] };
    }
    // Search filter
    if (search?.trim()) {
        const value = search.trim();
        matchFilter.$or = [
            { fullName: { $regex: `^${value}`, $options: "i" } },
            { email: { $regex: `^${value}`, $options: "i" } },
            { idNo: { $regex: `^${value}`, $options: "i" } },
            { phoneNumber: { $regex: `^${value}`, $options: "i" } },
        ];
    }
    // Aggregation pipeline
    const pipeline = [
        { $match: matchFilter },
        {
            $lookup: {
                from: "actorpayments",
                let: { actorId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$actor", "$$actorId"] },
                                    { $eq: ["$year", String(year)] },
                                ],
                            },
                        },
                    },
                ],
                as: "payments",
            },
        },
        {
            $addFields: {
                paid: { $gt: [{ $size: "$payments" }, 0] },
                amount: { $arrayElemAt: ["$payments.amount", 0] },
            },
        },
    ];
    // Status filtering
    if (status === "paid") {
        pipeline.push({ $match: { paid: true } });
    }
    if (status === "pending") {
        pipeline.push({ $match: { paid: false } });
    }
    // Final projection + sorting + limit
    pipeline.push({
        $project: {
            fullName: 1,
            idNo: 1,
            dob: 1,
            paid: 1,
            amount: 1,
        },
    }, { $sort: { [sortBy]: sortWith } }, { $limit: limit });
    const actors = await actor_schema_1.default.aggregate(pipeline);
    return { actors };
};
const notifyActorForPayment = async (payload) => {
    const { fee, actorId, desc, number, year } = payload;
    if (!fee || isNaN(Number(fee))) {
        throw new error_1.AppError(400, "Valid fee is required");
    }
    if (!desc) {
        throw new error_1.AppError(400, "desc is required");
    }
    if (!number) {
        throw new error_1.AppError(400, "number is required");
    }
    if (!year) {
        throw new error_1.AppError(400, "year is required");
    }
    if (!actorId || actorId.length < 1) {
        throw new error_1.AppError(400, "Select which actor you want to notify");
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const amount = Number(fee);
            const existing = await actor_payment_schema_1.NotifyPayment.find({
                actorId: { $in: actorId },
                year,
                number,
                amount,
            }).session(session);
            if (existing.length > 0) {
                throw new error_1.AppError(400, `Some actors already notified for year ${year}`);
            }
            const notifyPaymentData = actorId.map((id) => ({
                actorId: id,
                amount,
                number,
                desc,
                year,
            }));
            const notifyPayments = await actor_payment_schema_1.NotifyPayment.insertMany(notifyPaymentData, {
                session,
            });
            if (!notifyPayments || notifyPayments.length < 1) {
                throw new error_1.AppError(400, "Failed to create notify payment");
            }
            const notificationData = notifyPayments.map((notify) => ({
                recipientRole: ["member"],
                recipient: notify.actorId,
                type: "NOTIFY_PAYMENT",
                title: "Payment Notification",
                message: `You have been notified to pay ৳${amount} in ${year || ""}. ${desc || ""}`,
                notifyPayment: notify._id,
                isRead: false,
            }));
            console.log(notificationData, notifyPayments);
            const notifications = await notification_schema_1.Notification.insertMany(notificationData, {
                session,
            });
            if (!notifications || notifications.length < 1) {
                throw new error_1.AppError(400, "Failed to create Notification");
            }
        });
    }
    catch (error) {
        if (error.code === 11000) {
            throw new error_1.AppError(400, "Duplicate payment notification detected");
        }
        throw new error_1.AppError(400, `${error}`);
    }
    session.endSession();
};
const fetchNotifyPayments = async (idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "Member idNo is required");
    }
    const actorId = await actor_schema_1.default.findOne({ idNo }).select("_id").lean();
    const notifyPayments = await actor_payment_schema_1.NotifyPayment.find({
        actorId,
    }).sort({ createdAt: -1 });
    if (!notifyPayments || notifyPayments.length < 1) {
        throw new error_1.AppError(202, "No notify payment");
    }
    return notifyPayments;
};
const paymentSubmitted = async (senderNumber, transactionId, notifyPaymentId, actorId, type, year, amount) => {
    if (!senderNumber) {
        throw new error_1.AppError(400, "senderNumber is required");
    }
    if (!transactionId) {
        throw new error_1.AppError(400, "Member transactionId is required");
    }
    if (!type || !year || !amount) {
        throw new error_1.AppError(400, "type,year,amount is required");
    }
    if (!notifyPaymentId) {
        throw new error_1.AppError(400, "Member notifyPaymentId is required");
    }
    const existing = await actor_payment_schema_1.NotifyPayment.findById(notifyPaymentId).lean();
    if (!existing) {
        throw new error_1.AppError(400, "This notify payment not found");
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const updateNotifyPayment = await actor_payment_schema_1.NotifyPayment.findByIdAndUpdate(notifyPaymentId, {
                $set: {
                    status: "paid",
                },
            }, {
                new: true,
                runValidators: true,
                session,
            });
            if (!updateNotifyPayment) {
                throw new error_1.AppError(400, "Updated failed");
            }
            await actor_payment_schema_1.default.create([
                {
                    actor: actorId,
                    notifyPayment: updateNotifyPayment._id,
                    type,
                    year,
                    amount: Number(amount),
                    transactionId,
                    number: senderNumber,
                    desc: updateNotifyPayment.desc
                },
            ], { session });
            await notification_schema_1.Notification.create([
                {
                    recipientRole: ["admin", "superadmin"],
                    type: "PAYMENT_SUBMITTED",
                    title: "Payment verify Notification",
                    message: "New payment submitted by an actor. Verification required.",
                    isRead: false,
                    notifyPayment: updateNotifyPayment._id
                },
            ], { session });
        });
    }
    catch (error) { }
    session.endSession();
};
const fetchActorPayments = async (idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "Member idNo is required");
    }
    const actorId = await actor_schema_1.default.findOne({ idNo }).select("_id").lean();
    const actorPayments = await actor_payment_schema_1.default.find({
        actor: actorId,
        status: "verified"
    }).sort({ createdAt: -1 });
    if (!actorPayments || actorPayments.length < 1) {
        throw new error_1.AppError(202, "No actor Payments");
    }
    return actorPayments;
};
const verifyActorPayment = async (paymentId, notifyPayment) => {
    if (!paymentId) {
        throw new error_1.AppError(400, "paymentId is required");
    }
    if (!notifyPayment) {
        throw new error_1.AppError(400, "notifyPayment is required");
    }
    const existing = await actor_payment_schema_1.NotifyPayment.findById(notifyPayment).lean();
    if (!existing) {
        throw new error_1.AppError(400, "This notify payment not found");
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const updateNotifyPayment = await actor_payment_schema_1.NotifyPayment.findByIdAndDelete(notifyPayment, {
                new: true,
                runValidators: true,
                session,
            });
            if (!updateNotifyPayment) {
                throw new error_1.AppError(400, "Updated failed");
            }
            await notification_schema_1.Notification.findOneAndUpdate({ notifyPayment,
                type: "PAYMENT_SUBMITTED"
            }, { $set: { isRead: true } }, { new: true, runValidators: true, session });
            await actor_payment_schema_1.default.findByIdAndUpdate(paymentId, {
                $set: { status: "verified" },
            }, { session });
            // await Notification.create(
            //   [
            //     {
            //       recipientRole: ["admin", "superadmin"],
            //       type: "PAYMENT_SUBMITTED",
            //       title: "Payment verify Notification",
            //       message:
            //         "New payment submitted by an actor. Verification required.",
            //       isRead: false,
            //     },
            //   ],
            //   { session },
            // );
        });
    }
    catch (error) { }
    session.endSession();
};
exports.ActorPaymentService = {
    actorPaymentInfo,
    notifyActorForPayment,
    fetchNotifyPayments,
    paymentSubmitted,
    fetchActorPayments,
    verifyActorPayment,
};
