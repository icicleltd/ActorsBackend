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
const number_to_words_1 = require("number-to-words");
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const error_1 = require("../middleware/error");
const notification_schema_1 = require("../notification/notification.schema");
const actor_payment_schema_1 = __importStar(require("./actor.payment.schema"));
const payment_schema_1 = require("../payment/payment.schema");
const actorJoin_1 = require("../helper/actorJoin");
const emailHelper_1 = require("../helper/emailHelper");
const receiptEmail_1 = require("../helper/mailTempate/receiptEmail");
const paymentRejectedTemplate_1 = require("../helper/mailTempate/paymentRejectedTemplate");
const actorPaymentInfo = async (id, search, limit, sortBy, sortWith, alive, year, status, page = 1) => {
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
    // Base pipeline: match -> lookup payments -> compute paid/amount
    const basePipeline = [
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
    // Status filtering — applied before the $facet split so both
    // the data branch and the count branch reflect the same filter
    if (status === "paid") {
        basePipeline.push({ $match: { paid: true } });
    }
    if (status === "pending") {
        basePipeline.push({ $match: { paid: false } });
    }
    // $facet: paginated data + total count in a single query
    const pipeline = [
        ...basePipeline,
        {
            $facet: {
                data: [
                    {
                        $project: {
                            fullName: 1,
                            idNo: 1,
                            dob: 1,
                            paid: 1,
                            amount: 1,
                            status: 1,
                        },
                    },
                    { $sort: { [sortBy]: sortWith } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
        {
            $project: {
                data: 1,
                total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
            },
        },
    ];
    const result = await actor_schema_1.default.aggregate(pipeline);
    const actors = result[0]?.data ?? [];
    const total = result[0]?.total ?? 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    return { actors, total, totalPages, page, limit };
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
                year: Number(year),
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
            const notifications = await notification_schema_1.Notification.insertMany(notificationData, {
                session,
            });
            if (!notifications || notifications.length < 1) {
                throw new error_1.AppError(400, "Failed to create Notification");
            }
            await (0, actorJoin_1.syncActorJoinYearBulk)(actorId, Number(year), session);
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
const paymentSubmitted = async (payload) => {
    const { senderNumber, transactionId, method, idNo, type, year, actorId, accountNo, amount, notifyPaymentId, bankName, date, } = payload;
    if (!method) {
        throw new error_1.AppError(400, "method is required");
    }
    if (method) {
        if (method === "bkash") {
            if (!senderNumber) {
                throw new error_1.AppError(400, "senderNumber is required");
            }
            if (!transactionId) {
                throw new error_1.AppError(400, "Member transactionId is required");
            }
        }
        if (method === "bank") {
            if (!accountNo) {
                throw new error_1.AppError(400, "Account No is required");
            }
            if (!bankName) {
                throw new error_1.AppError(400, "Bank Name is required");
            }
            if (!date) {
                throw new error_1.AppError(400, "Date is required");
            }
        }
    }
    if (!type || !year || !amount) {
        throw new error_1.AppError(400, "type,year,amount is required");
    }
    if (!notifyPaymentId) {
        throw new error_1.AppError(400, "Member notifyPaymentId is required");
    }
    const actor = await actor_schema_1.default.findOne({ idNo }).select("_id").lean();
    if (!actor) {
        throw new error_1.AppError(400, "Actor not found");
    }
    const isSame = actor._id.toString() === actorId;
    if (!isSame) {
        throw new error_1.AppError(403, "You are not authorized to submit payment for this actor.");
    }
    const isBank = method === "bank";
    const isBkash = method === "bkash";
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
                    year: Number(year),
                    amount: Number(amount),
                    number: isBkash ? senderNumber : "",
                    transactionId: isBkash ? transactionId : "",
                    bankName: isBank ? bankName : "",
                    accountNo: isBank ? accountNo : "",
                    date: isBank ? new Date(date?.toString()) : "",
                    isView: true,
                    method: method,
                },
            }, {
                returnDocument: "after",
                runValidators: true,
                session,
            });
            if (!updateNotifyPayment) {
                throw new error_1.AppError(400, "Updated failed");
            }
            await actor_payment_schema_1.default.findOneAndDelete({
                notifyPayment: updateNotifyPayment._id,
                status: "rejected",
            }, { session });
            await actor_payment_schema_1.default.create([
                {
                    actor: actorId,
                    notifyPayment: updateNotifyPayment._id,
                    type,
                    year: Number(year),
                    amount: Number(amount),
                    desc: updateNotifyPayment.desc,
                    ...(isBkash && { number: senderNumber, transactionId }),
                    ...(isBank && {
                        bankName,
                        accountNo,
                        date: new Date(date?.toString()),
                    }),
                    method,
                    status: "pending",
                    recordedVia: "notify"
                },
            ], { session });
            await notification_schema_1.Notification.findOneAndDelete({
                notifyPayment: notifyPaymentId,
                recipient: actor._id,
            }, { session });
            await notification_schema_1.Notification.create([
                {
                    recipientRole: ["admin", "superadmin"],
                    type: "PAYMENT_SUBMITTED",
                    title: "Payment verify Notification",
                    message: "New payment submitted by an actor. Verification required.",
                    isRead: false,
                    notifyPayment: updateNotifyPayment._id,
                },
            ], { session });
        });
    }
    finally {
        await session.endSession();
    }
};
const fetchActorPayments = async (idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "Member idNo is required");
    }
    const actorId = await actor_schema_1.default.findOne({ idNo }).select("_id").lean();
    const actorPayments = await actor_payment_schema_1.default.find({
        actor: actorId,
        // status: "verified",
    }).sort({ createdAt: -1 });
    if (!actorPayments || actorPayments.length < 1) {
        throw new error_1.AppError(202, "No actor Payments");
    }
    return actorPayments;
};
const verifyActorPayment = async (notifyPayment) => {
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
            // const updateNotifyPayment = await NotifyPayment.findByIdAndUpdate(
            //   notifyPayment,
            //   {
            //     $set: {
            //       status: "paid",
            //     },
            //   },
            //   {
            //     new: true,
            //     runValidators: true,
            //     session,
            //   },
            // );
            // if (!updateNotifyPayment) {
            //   throw new AppError(400, "Updated failed");
            // }
            await notification_schema_1.Notification.findOneAndUpdate({ notifyPayment, type: "PAYMENT_SUBMITTED" }, { $set: { isRead: true } }, { new: true, runValidators: true, session });
            const updateActorPayment = await actor_payment_schema_1.default.findOneAndUpdate({ notifyPayment: new mongoose_1.Types.ObjectId(notifyPayment) }, {
                $set: { status: "verified" },
            }, { session });
            if (!updateActorPayment) {
                throw new error_1.AppError(400, "Updated failed");
            }
            await actor_payment_schema_1.NotifyPayment.findOneAndDelete({
                _id: notifyPayment,
                status: "paid",
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
const getPaymentDashboardStats = async ({ year }) => {
    if (!year)
        throw new error_1.AppError(400, "Year is required");
    const numericYear = Number(year);
    const start = new Date(`${numericYear}-01-01`);
    const end = new Date(`${numericYear}-12-31T23:59:59.999Z`);
    const [actorPaymentResult, notifyPaymentResult, beMemberResult] = await Promise.all([
        actor_payment_schema_1.default.aggregate([
            {
                $match: {
                    year: numericYear,
                    type: "membership",
                    status: { $in: ["verified", "pending"] },
                },
            },
            {
                $group: {
                    _id: null, // merge into a single doc, don't split by status
                    totalPaidAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "verified"] }, "$amount", 0] },
                    },
                    totalPaidActors: {
                        $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] },
                    },
                    totalUnverifiedAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
                    },
                    totalUnverifiedPaidActors: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                    },
                },
            },
        ]),
        actor_payment_schema_1.NotifyPayment.aggregate([
            {
                $match: {
                    year: numericYear,
                    type: "membership",
                    status: "request",
                },
            },
            {
                $group: {
                    _id: null,
                    totalUnpaidAmount: { $sum: "$amount" },
                    totalUnpaidActors: { $sum: 1 },
                },
            },
        ]),
        payment_schema_1.Payment.aggregate([
            {
                $match: {
                    status: { $in: ["pending", "verified"] },
                    createdAt: { $gte: start, $lte: end }, // reverted to createdAt — confirm this is what you want
                },
            },
            {
                $group: {
                    _id: null,
                    totalPaidNewMemberAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "verified"] }, "$amount", 0] },
                    },
                    totalPaidNewMembers: {
                        $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] },
                    },
                    totalUnverifiedNewMemberAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
                    },
                    totalUnverifiedNewMembers: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                    },
                },
            },
        ]),
    ]);
    const actorPayment = actorPaymentResult[0] ?? {};
    const notifyPayment = notifyPaymentResult[0] ?? {};
    const beMemberPayment = beMemberResult[0] ?? {};
    const paidAmount = actorPayment.totalPaidAmount ?? 0;
    const paidActors = actorPayment.totalPaidActors ?? 0;
    const totalUnverifiedAmount = actorPayment.totalUnverifiedAmount ?? 0;
    const totalUnverifiedPaidActors = actorPayment.totalUnverifiedPaidActors ?? 0;
    const unPaidAmount = notifyPayment.totalUnpaidAmount ?? 0;
    const unPaidActors = notifyPayment.totalUnpaidActors ?? 0;
    const beMemberPaidAmount = beMemberPayment.totalPaidNewMemberAmount ?? 0;
    const beMemberPaidBeMembers = beMemberPayment.totalPaidNewMembers ?? 0;
    const totalUnverifiedBeMemberAmount = beMemberPayment.totalUnverifiedNewMemberAmount ?? 0;
    const totalUnverifiedPaidBeMembers = beMemberPayment.totalUnverifiedNewMembers ?? 0;
    // fixed: was mixing a count (paidActors) with a currency amount (beMemberPaidAmount)
    const totalHandCash = paidAmount + beMemberPaidAmount;
    return {
        paidAmount,
        paidActors,
        totalUnverifiedAmount,
        totalUnverifiedPaidActors,
        unPaidAmount,
        unPaidActors,
        beMemberPaidAmount,
        beMemberPaidBeMembers,
        totalUnverifiedBeMemberAmount,
        totalUnverifiedPaidBeMembers,
        totalHandCash,
    };
};
const getMergedPaymentsFromDB = async (query) => {
    const { search, filter, page = 1, limit = 10, sortBy = "createdAt", sortOrder = -1, skip = 0, year, } = query;
    const pipeline = [];
    /**
     * Lookup actorPayments
     */
    pipeline.push({
        $lookup: {
            from: "actorpayments",
            localField: "_id",
            foreignField: "notifyPayment",
            as: "actorPayment",
        },
    });
    pipeline.push({
        $unwind: {
            path: "$actorPayment",
            preserveNullAndEmptyArrays: true,
        },
    });
    /**
     * Populate actor
     */
    pipeline.push({
        $lookup: {
            from: "actors",
            localField: "actorId",
            foreignField: "_id",
            as: "actor",
        },
    });
    pipeline.push({
        $unwind: "$actor",
    });
    /**
     * Normalize year (string vs number problem)
     */
    pipeline.push({
        $addFields: {
            notifyYear: { $toInt: "$year" },
            actorPaymentYear: {
                $cond: [
                    { $ifNull: ["$actorPayment.year", false] },
                    { $toInt: "$actorPayment.year" },
                    null,
                ],
            },
        },
    });
    /**
     * Search
     */
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { "actor.fullName": { $regex: search, $options: "i" } },
                    { "actor.idNo": { $regex: search, $options: "i" } },
                ],
            },
        });
    }
    /**
     * Year filter
     */
    if (typeof year === "number" && !Number.isNaN(year)) {
        pipeline.push({
            $match: {
                $or: [{ notifyYear: year }, { actorPaymentYear: year }],
            },
        });
    }
    /**
     * Status filter
     */
    // unpaid → admin requested but member didn't pay
    if (filter === "unpaid") {
        pipeline.push({
            $match: {
                status: "request",
                actorPayment: null,
            },
        });
    }
    // pending → member paid but admin not verified
    if (filter === "needVerified") {
        pipeline.push({
            $match: {
                "actorPayment.status": "pending",
            },
        });
    }
    // verified → admin verified payment
    if (filter === "paid") {
        pipeline.push({
            $match: {
                "actorPayment.status": "verified",
            },
        });
    }
    /**
     * Final merged status
     */
    pipeline.push({
        $addFields: {
            finalStatus: {
                $cond: [
                    { $eq: ["$actorPayment.status", "verified"] },
                    "verified",
                    {
                        $cond: [
                            { $eq: ["$actorPayment.status", "pending"] },
                            "pending",
                            "requested",
                        ],
                    },
                ],
            },
        },
    });
    /**
     * Projection
     */
    pipeline.push({
        $project: {
            amount: 1,
            number: 1,
            year: "$notifyYear",
            desc: 1,
            finalStatus: 1,
            createdAt: 1,
            // transactionId:1,
            actor: {
                _id: "$actor._id",
                fullName: "$actor.fullName",
                idNo: "$actor.idNo",
                photo: "$actor.photo",
            },
            payment: "$actorPayment",
        },
    });
    /**
     * Sorting
     */
    pipeline.push({
        $sort: {
            [sortBy]: sortOrder,
        },
    });
    /**
     * Pagination
     */
    pipeline.push({
        $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            meta: [{ $count: "total" }],
        },
    });
    const result = await actor_payment_schema_1.NotifyPayment.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.meta[0]?.total || 0;
    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
};
const yearlyActorPaymentStats = async (query) => {
    const { search, filter, page = 1, limit = 10, sortBy = "createdAt", sortOrder = -1, skip = 0, year, } = query;
    if (filter && !["unpaid", "needVerified", "paid", "all"].includes(filter)) {
        throw new error_1.AppError(400, "Invalid filter value. Must be 'unpaid', 'needVerified', 'all', or 'paid'.");
    }
    if ((filter === "paid" || filter === "needVerified" || filter === "unpaid") &&
        !year) {
        throw new error_1.AppError(400, `Year is required for '${filter}' filter.`);
    }
    const actorLookupStages = (search) => {
        const stages = [
            {
                $lookup: {
                    from: "actors",
                    localField: "actor",
                    foreignField: "_id",
                    pipeline: [{ $project: { fullName: 1, photo: 1, idNo: 1 } }],
                    as: "actorInfo",
                },
            },
            {
                $unwind: "$actorInfo",
            },
        ];
        if (search && search.trim()) {
            stages.push({
                $match: {
                    $or: [
                        { "actorInfo.fullName": { $regex: search, $options: "i" } },
                        { "actorInfo.idNo": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }
        return stages;
    };
    const buildResult = (result, pageNum, limitNum) => {
        const data = result[0]?.data ?? [];
        const total = result[0]?.totalCount?.[0]?.count ?? 0;
        return {
            data,
            meta: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    };
    const paginateFacet = (skip, limit) => ({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        source: 1,
                        historyStatus: 1,
                        date: 1,
                        amount: 1,
                        method: 1,
                        type: 1,
                        year: 1,
                        status: 1,
                        desc: 1,
                        transactionId: 1,
                        number: 1,
                        actorInfo: 1,
                        createdAt: 1,
                        updatedAt: 1,
                    },
                },
            ],
            totalCount: [{ $count: "count" }],
        },
    });
    if (filter === "paid" || filter === "needVerified") {
        const filterCondition = filter === "paid" ? "verified" : "pending";
        const match = {
            type: "membership",
            status: filterCondition,
            ...(year ? { year } : {}),
        };
        const pipeline = [
            { $match: match },
            {
                $addFields: {
                    source: "ActorPayment",
                    // historyStatus: "paid",
                    historyStatus: {
                        $cond: [{ $eq: ["$status", "verified"] }, "paid", "needVerified"],
                    },
                    date: "$verifiedAt",
                },
            },
            ...actorLookupStages(search),
            { $sort: { date: -1 } },
            paginateFacet(skip, limit),
        ];
        const result = await actor_payment_schema_1.default.aggregate(pipeline);
        return buildResult(result, page, limit);
    }
    if (filter === "unpaid") {
        const filterCondition = filter === "unpaid" ? "request" : "paid";
        const match = {
            type: "membership",
            status: "request",
            ...(year ? { year } : {}),
        };
        const pipeline = [
            { $match: match },
            {
                $addFields: {
                    source: "NotifyPayment",
                    historyStatus: filter,
                    date: "$createdAt",
                    actor: "$actorId",
                },
            },
            ...actorLookupStages(search),
            { $sort: { [sortBy]: sortOrder } },
            paginateFacet(skip, limit),
        ];
        const result = await actor_payment_schema_1.NotifyPayment.aggregate(pipeline);
        return buildResult(result, page, limit);
    }
    const actorPaymentMatch = {
        type: "membership",
        status: { $in: ["pending", "verified"] },
        ...(year ? { year } : {}),
    };
    const notifyPaymentMatch = {
        type: "membership",
        status: { $in: ["request"] },
        ...(year ? { year } : {}),
    };
    const pipeline = [
        { $match: actorPaymentMatch },
        {
            $addFields: {
                source: "ActorPayment",
                historyStatus: {
                    $cond: [{ $eq: ["$status", "verified"] }, "paid", "needVerified"],
                },
                date: "$verifiedAt",
            },
        },
        {
            $unionWith: {
                coll: "notifypayments",
                pipeline: [
                    { $match: notifyPaymentMatch },
                    {
                        $addFields: {
                            source: "NotifyPayment",
                            // historyStatus: {
                            //   $cond: [{ $eq: ["$status", "paid"] }, "needVerified", "unpaid"],
                            // },
                            historyStatus: "unpaid",
                            date: "$createdAt",
                            actor: "$actorId",
                        },
                    },
                ],
            },
        },
        ...actorLookupStages(search),
        { $sort: { date: -1 } },
        paginateFacet(skip, limit),
    ];
    const result = await actor_payment_schema_1.default.aggregate(pipeline);
    return buildResult(result, page, limit);
    // return {
    //   meta: {
    //     page,
    //     limit,
    //     total,
    //   },
    //   data,
    // };
};
const recordActorPayment = async (payload, userId) => {
    const { actorIds, fee, year, desc } = payload;
    actorIds.forEach((actorId) => {
        if (!mongoose_1.Types.ObjectId.isValid(actorId)) {
            throw new error_1.AppError(404, "Invalid actorId");
        }
    });
    if (!fee)
        throw new error_1.AppError(400, "Fee is required");
    if (!year)
        throw new error_1.AppError(400, "Year is required");
    // if (!desc) throw new AppError(400, "Payment type  is required");
    const recordedActorPayment = actorIds.map((actorId) => ({
        actor: new mongoose_1.Types.ObjectId(actorId),
        type: "membership",
        year,
        amount: fee,
        desc,
        method: "cash",
        status: "verified",
        recordedVia: "direct",
        verifiedAt: new Date(),
        verifiedBy: userId,
    }));
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const record = await actor_payment_schema_1.default.create(recordedActorPayment, {
            session,
            ordered: true,
        });
        if (!record || record.length < 1) {
            throw new error_1.AppError(400, "Failed to record actor payment");
        }
        await (0, actorJoin_1.syncActorJoinYearBulk)(actorIds, Number(year), session);
        await session.commitTransaction();
        return record;
    }
    catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw error;
    }
    finally {
        await session.endSession();
    }
    // const result = await ActorPayment.create(recordedActorPayment);
    // if (!result || result.length < 1) {
    //   throw new AppError(400, "Failed to record actor payment");
    // }
    // return result;
};
const actorPaymentHistory = async (query) => {
    const { search, filter, page = 1, limit = 10, sortBy = "idNo", sortOrder = -1, skip = 0, year, } = query;
    if (filter && !["unpaid", "needVerified", "paid", "all"].includes(filter)) {
        throw new error_1.AppError(400, "Invalid filter value. Must be 'unpaid', 'needVerified', 'all', or 'paid'.");
    }
    if ((filter === "paid" || filter === "unpaid") && !year) {
        throw new error_1.AppError(400, `Year is required for '${filter}' filter.`);
    }
    const pipeline = [
        // 1. Only active actors (adjust if you want all)
        { $match: { isActive: true } },
        // 2. Search by fullName or idNo
        ...(search
            ? [
                {
                    $match: {
                        $or: [
                            { fullName: { $regex: search, $options: "i" } },
                            { idNo: { $regex: search, $options: "i" } },
                        ],
                    },
                },
            ]
            : []),
        // 3. Look up this actor's membership payment for the given year
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
                                    { $eq: ["$type", "membership"] },
                                    { $eq: ["$year", year] },
                                ],
                            },
                        },
                    },
                    { $limit: 1 }, // unique index guarantees at most 1 anyway
                ],
                as: "paymentInfo",
            },
        },
        // 4. Derive paid/unpaid status
        {
            $addFields: {
                paymentStatus: {
                    $cond: [{ $gt: [{ $size: "$paymentInfo" }, 0] }, "paid", "unpaid"],
                },
                payment: { $arrayElemAt: ["$paymentInfo", 0] },
            },
        },
        // 5. Apply filter
        ...(filter !== "all" ? [{ $match: { paymentStatus: filter } }] : []),
        // 6. Shape output + paginate
        {
            $project: {
                _id: 1,
                fullName: 1,
                idNo: 1,
                photo: 1,
                dob: 1,
                phoneNumber: 1,
                paymentStatus: 1,
                payment: {
                    _id: 1,
                    amount: 1,
                    method: 1,
                    transactionId: 1,
                    verifiedAt: 1,
                    status: 1,
                },
            },
        },
        { $sort: { idNo: 1 } },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        },
    ];
    const result = await actor_schema_1.default.aggregate(pipeline);
    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount?.[0]?.count ?? 0;
    return {
        data,
        meta: {
            page: page,
            limit: limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const getYearlyActorPaymentStatus = async (query) => {
    const { search, filter, page = 1, limit = 10, sortBy = "idNo", sortOrder = -1, skip = 0, year, lifeTime, passedAway, } = query;
    if (filter &&
        !["unpaid", "needVerified", "paid", "all", "requested"].includes(filter)) {
        throw new error_1.AppError(400, "Invalid filter value. Must be 'unpaid', 'needVerified', 'all', or 'paid'.");
    }
    if (lifeTime && typeof lifeTime !== "boolean")
        throw new error_1.AppError(400, "Only allow boolean");
    if (passedAway && typeof passedAway !== "boolean")
        throw new error_1.AppError(400, "Only allow boolean");
    if ((filter === "paid" || filter === "unpaid") && !year) {
        throw new error_1.AppError(400, `Year is required for '${filter}' filter.`);
    }
    const excludeRanks = [];
    if (!lifeTime)
        excludeRanks.push("lifeTime");
    if (!passedAway)
        excludeRanks.push("pastWay");
    const baseMatch = { isActive: true };
    if (excludeRanks.length > 0) {
        baseMatch["rankHistory.rank"] = { $nin: excludeRanks };
    }
    const pipeline = [
        // 1. Only active actors (adjust if you want all)
        { $match: baseMatch },
        // 2. Search by fullName or idNo
        ...(search
            ? [
                {
                    $match: {
                        $or: [
                            { fullName: { $regex: search, $options: "i" } },
                            { idNo: { $regex: search, $options: "i" } },
                        ],
                    },
                },
            ]
            : []),
        // 3. Look up this actor's membership payment for the given year
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
                                    { $eq: ["$type", "membership"] },
                                    { $eq: ["$year", year] },
                                ],
                            },
                        },
                    },
                    { $limit: 1 }, // unique index guarantees at most 1 anyway
                ],
                as: "paymentInfo",
            },
        },
        {
            $lookup: {
                from: "notifypayments",
                let: { actorId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$actorId", "$$actorId"] },
                                    { $eq: ["$type", "membership"] },
                                    { $eq: ["$year", year] },
                                ],
                            },
                        },
                    },
                    { $limit: 1 },
                ],
                as: "notifyPaymentInfo",
            },
        },
        {
            $addFields: {
                notifyPayment: { $arrayElemAt: ["$notifyPaymentInfo", 0] },
                actorPayment: { $arrayElemAt: ["$paymentInfo", 0] },
            },
        },
        // 4. Derive paid/unpaid status
        {
            $addFields: {
                paymentStatus: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ["$notifyPayment.status", "request"] },
                                then: "requested",
                            },
                            {
                                case: {
                                    $or: [
                                        { $eq: ["$notifyPayment.status", "paid"] },
                                        { $eq: ["$actorPayment.status", "pending"] },
                                    ],
                                },
                                then: "needVerified",
                            },
                            {
                                case: {
                                    $eq: ["$actorPayment.status", "verified"],
                                },
                                then: "paid",
                            },
                            {
                                case: {
                                    $eq: ["$actorPayment.status", "rejected"],
                                },
                                then: "rejected",
                            },
                        ],
                        default: "unpaid",
                    },
                },
            },
        },
        {
            $addFields: {
                payment: {
                    $cond: [
                        { $eq: ["$paymentStatus", "requested"] },
                        "notifyPayment",
                        { $ifNull: ["$actorPayment", "notifyPayment"] },
                    ],
                },
            },
        },
        // 5. Apply filter
        ...(filter !== "all" ? [{ $match: { paymentStatus: filter } }] : []),
        // 6. Shape output + paginate
        {
            $project: {
                _id: 1,
                fullName: 1,
                idNo: 1,
                photo: 1,
                dob: 1,
                phoneNumber: 1,
                paymentStatus: 1,
                actorPayment: 1,
                notifyPayment: 1,
                payment: {
                    _id: 1,
                    amount: 1,
                    method: 1,
                    transactionId: 1,
                    verifiedAt: 1,
                    status: 1,
                },
            },
        },
        { $sort: { idNo: 1 } },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        },
    ];
    const result = await actor_schema_1.default.aggregate(pipeline);
    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount?.[0]?.count ?? 0;
    return {
        data,
        meta: {
            page: page,
            limit: limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const MAX_CLIENT_ROWS = 5000;
const ACTOR_STATUS_MAP = {
    needVerified: "pending",
    paid: "verified",
};
function normalizeActorStatus(status) {
    switch (status) {
        case "pending":
            return "need Verified";
        case "verified":
            return "paid";
        case "rejected":
            return "rejected"; // no client-facing equivalent given — keeping as-is
        default:
            return status;
    }
}
function normalizeNotifyStatus(status) {
    switch (status) {
        case "request":
            return "unpaid";
        case "paid":
            return "paid";
        default:
            return status;
    }
}
const getPaymentReportCursor = async (filter) => {
    const { status = "all", type, year } = filter;
    if (status === "unpaid") {
        return walkNotifyOnly(type, year);
    }
    if (status === "needVerified" || status === "paid") {
        return walkActorOnly(type, year, ACTOR_STATUS_MAP[status]);
    }
    return walkCombined(type, year); // status === "all"
};
async function walkActorOnly(type, year, status) {
    const query = { type, year, status };
    const [walkResult, sumResult] = await Promise.all([
        walkPayments(query),
        actor_payment_schema_1.default.aggregate([
            { $match: query },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]),
    ]);
    return { totalAmount: sumResult[0]?.totalAmount ?? 0, ...walkResult };
}
async function walkNotifyOnly(type, year) {
    const query = { type, year, status: "request" };
    const [walkResult, sumResult] = await Promise.all([
        walkNotifyPayments(query),
        actor_payment_schema_1.NotifyPayment.aggregate([
            { $match: query },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]),
    ]);
    return { totalAmount: sumResult[0]?.totalAmount ?? 0, ...walkResult };
}
async function walkCombined(type, year) {
    const actorQuery = { type, year };
    const notifyQuery = { type, year, status: "request" };
    const [actorWalk, notifyWalk, actorSum, notifySum] = await Promise.all([
        walkPayments(actorQuery),
        walkNotifyPayments(notifyQuery),
        actor_payment_schema_1.default.aggregate([
            { $match: actorQuery },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]),
        actor_payment_schema_1.NotifyPayment.aggregate([
            { $match: notifyQuery },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]),
    ]);
    const merged = [...actorWalk.data, ...notifyWalk.data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return {
        totalAmount: (actorSum[0]?.totalAmount ?? 0) + (notifySum[0]?.totalAmount ?? 0),
        total: actorWalk.total + notifyWalk.total,
        returned: Math.min(merged.length, MAX_CLIENT_ROWS),
        truncated: merged.length > MAX_CLIENT_ROWS ||
            actorWalk.truncated ||
            notifyWalk.truncated,
        data: merged.slice(0, MAX_CLIENT_ROWS),
    };
}
async function walkPayments(query) {
    const cursor = actor_payment_schema_1.default.find(query)
        .select("actor amount desc status createdAt year method transactionId number type")
        .populate("actor", "fullName idNo")
        .lean()
        .maxTimeMS(60000)
        .sort({ createdAt: 1 })
        .cursor({ batchSize: 1000 });
    const results = [];
    let count = 0;
    let truncated = false;
    try {
        for await (const d of cursor) {
            count++;
            if (results.length < MAX_CLIENT_ROWS) {
                results.push({
                    ...d,
                    status: normalizeActorStatus(d.status),
                    source: "ActorPayment",
                });
            }
            else {
                truncated = true;
                break;
            }
        }
    }
    finally {
        await cursor.close();
    }
    return { total: count, returned: results.length, truncated, data: results };
}
async function walkNotifyPayments(query) {
    const cursor = actor_payment_schema_1.NotifyPayment.find(query)
        .select("actorId amount desc status createdAt year eventId number type transactionId rejectionReason")
        .populate("actorId", "fullName idNo email")
        .lean()
        .maxTimeMS(60000)
        .sort({ createdAt: 1 })
        .cursor({ batchSize: 1000 });
    const results = [];
    let count = 0;
    let truncated = false;
    try {
        for await (const doc of cursor) {
            count++;
            if (results.length < MAX_CLIENT_ROWS) {
                const { actorId, status, ...rest } = doc;
                results.push({
                    ...rest,
                    status: normalizeNotifyStatus(status),
                    actor: actorId,
                    source: "NotifyPayment",
                });
            }
            else {
                truncated = true;
                break;
            }
        }
    }
    finally {
        await cursor.close();
    }
    return { total: count, returned: results.length, truncated, data: results };
}
const actorUnpaidYearList = async (idNo) => {
    if (!idNo)
        throw new error_1.AppError(400, "Member id is required");
    const value = idNo.trim();
    if (!/^[a-zA-Z0-9-]+$/.test(value))
        throw new error_1.AppError(400, "Member ID can only contain letters, numbers, and hyphens");
    const existing = await actor_schema_1.default.findOne({
        idNo: value.toUpperCase(),
    })
        .select("id fullName idNo")
        .lean();
    if (!existing)
        throw new error_1.AppError(404, "Member not found by this id");
    const result = await actor_payment_schema_1.NotifyPayment.find({
        actorId: existing._id,
        status: "request",
        type: "membership",
    })
        .select("-_id year amount")
        .sort({ year: 1 })
        .lean();
    if (!result) {
        return { ...existing, unpaidYears: [] };
    }
    return { ...existing, unpaidYears: result };
};
const generateMemberShipBilling = async (userId, payload) => {
    const { actorId, years, method, bankName, accountNo, onlineBakNumber, transactionId, fee, note, } = payload;
    if (!mongoose_1.Types.ObjectId.isValid(actorId))
        throw new error_1.AppError(400, "Invalid actor id");
    const sanitizeMethod = method.toLowerCase().trim();
    const sanitizeTransactionId = transactionId?.trim();
    const sanitizeOnlineBakNumber = onlineBakNumber?.trim();
    const sanitizeAccountNo = accountNo?.trim();
    const sanitizeBankName = bankName?.trim();
    const isBank = sanitizeMethod === "bank";
    const isBkash = sanitizeMethod === "bkash";
    const extraFiveYear = new Date().getFullYear() + 5;
    if (!years?.length)
        throw new error_1.AppError(400, "Years is required");
    let numYears = [...new Set(years.map((year) => Number(year)))];
    if (numYears.some((y) => Number.isNaN(y) || y < 2017 || y > extraFiveYear))
        throw new error_1.AppError(400, "Years must be valid");
    if (!["bkash", "nagad", "cash", "bank"].includes(sanitizeMethod)) {
        throw new error_1.AppError(400, "Invalid method");
    }
    if (isBank && (!sanitizeAccountNo || !sanitizeBankName))
        throw new error_1.AppError(400, "For Method Bank. Bank Name and account number is required");
    if (isBkash && (!sanitizeOnlineBakNumber || !sanitizeTransactionId))
        throw new error_1.AppError(400, "For Method Bksah. Bkash number and transactionId is required");
    if (sanitizeOnlineBakNumber &&
        !/^01[3-9]\d{8}$/.test(sanitizeOnlineBakNumber))
        throw new error_1.AppError(400, "Invalid Bkash Number");
    const recordCollect = numYears.map((year) => ({
        actor: new mongoose_1.Types.ObjectId(actorId),
        type: "membership",
        year,
        // amount: fee ? Number(fee) : 2000,
        amount: 2000,
        desc: note ?? "",
        method: sanitizeMethod,
        ...(isBkash && {
            number: sanitizeOnlineBakNumber,
            transactionId: sanitizeTransactionId,
        }),
        ...(isBank && {
            bankName: sanitizeBankName,
            accountNo: sanitizeAccountNo,
            date: new Date(),
        }),
        status: "verified",
        recordedVia: "direct",
        verifiedAt: new Date(),
        verifiedBy: new mongoose_1.Types.ObjectId(userId),
    }));
    const session = await (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        // actor must exist — check first, before any writes
        const actorInfo = await actor_schema_1.default.findOne({ _id: new mongoose_1.Types.ObjectId(actorId) })
            .select("-_id fullName idNo")
            .session(session)
            .lean();
        if (!actorInfo)
            throw new error_1.AppError(404, "Actor not found");
        if (!actorInfo.idNo)
            throw new error_1.AppError(400, "Actor is missing a member ID");
        const actualUnpaid = await actor_payment_schema_1.NotifyPayment.find({
            actorId: new mongoose_1.Types.ObjectId(actorId),
            type: "membership",
            status: "request",
        }, { year: 1, _id: 1 }, { session }).lean();
        // if (!actualUnpaid) {
        //   throw new AppError(400, "This actor paid all ");
        // }
        const actualUnpaidYears = new Set(actualUnpaid.map((d) => d.year));
        const conflicting = await actor_payment_schema_1.default.find({
            actor: new mongoose_1.Types.ObjectId(actorId),
            type: "membership",
            year: { $in: numYears },
            status: { $in: ["pending", "verified"] },
        }, { year: 1, status: 1, _id: 0 }, { session }).lean();
        const pendingYears = conflicting
            .filter((p) => p.status === "pending")
            .map((p) => p.year);
        const verifiedYears = conflicting
            .filter((p) => p.status === "verified")
            .map((p) => p.year);
        if (pendingYears.length > 0)
            throw new error_1.AppError(409, `These years have already been paid and are awaiting verification: ${pendingYears.join(", ")}. Please check the payment notifications.`);
        if (verifiedYears.length > 0)
            throw new error_1.AppError(409, `These years are already paid and verified: ${verifiedYears.join(", ")}.`);
        const matchedIds = actualUnpaid
            .filter((payment) => numYears.includes(payment.year))
            .map((payment) => payment._id);
        await notification_schema_1.Notification.deleteMany({
            recipient: new mongoose_1.Types.ObjectId(actorId),
            notifyPayment: { $in: matchedIds },
        }, { session });
        await actor_payment_schema_1.NotifyPayment.deleteMany({
            actorId: new mongoose_1.Types.ObjectId(actorId),
            type: "membership",
            status: "request",
            year: { $in: numYears },
        }, { session });
        const result = await actor_payment_schema_1.default.create(recordCollect, {
            session,
            ordered: true,
        });
        const totalAmount = result.reduce((sum, curr) => sum + curr.amount, 0);
        const amountInWord = `${(0, number_to_words_1.toWords)(totalAmount)} taka only`;
        const allYear = result.map((payment) => payment.year).join(",");
        const receiptData = {
            totalAmount,
            amountInWord,
            allYear,
            title: "Membership fee",
            name: actorInfo.fullName,
            idNo: actorInfo.idNo,
        };
        // sent mail
        if (actorInfo.email) {
            (0, emailHelper_1.sendMail)({
                to: actorInfo.email,
                subject: "Membership Fee Payment Receipt — Actors Equity Bangladesh",
                text: `Dear ${actorInfo.fullName}, we have received your membership fee payment of ৳${totalAmount} for year(s) ${allYear}.`,
                html: (0, receiptEmail_1.buildReceiptEmailHtml)(receiptData),
            }).catch((err) => console.error("Receipt email failed:", err));
        }
        await session.commitTransaction();
        return receiptData;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
};
const rejectActorPayment = async (payload) => {
    const { userId, notifyPaymentId, message } = payload;
    const existing = await actor_payment_schema_1.NotifyPayment.findById(notifyPaymentId)
        .select("_id actorId year")
        .populate("actorId", "_id email fullName idNo")
        .lean();
    if (!existing) {
        throw new error_1.AppError(400, "Notify payment not found");
    }
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // change status in notify payment status paid to request
        const notifyPayment = await actor_payment_schema_1.NotifyPayment.findOneAndUpdate({
            _id: notifyPaymentId,
            type: "membership",
            status: "paid",
        }, { $set: { status: "request" } }, {
            runValidators: true,
            returnDocument: "after",
            session,
        });
        if (!notifyPayment)
            throw new error_1.AppError(400, "Not found Notify Payment");
        // change status in notify payment  status pending to rejected
        const actorPayment = await actor_payment_schema_1.default.findOneAndUpdate({
            notifyPayment: notifyPaymentId,
            type: "membership",
            status: "pending",
        }, {
            $set: {
                status: "rejected",
                verifiedBy: userId,
                verifiedAt: new Date(),
            },
        }, {
            runValidators: true,
            returnDocument: "after",
            session,
        });
        if (!actorPayment)
            throw new error_1.AppError(400, "Not found Actor Payment");
        // make notifications for reject
        await notification_schema_1.Notification.create([
            {
                notifyPayment: notifyPaymentId,
                recipientRole: ["member"],
                recipient: existing.actorId._id,
                type: "NOTIFY_PAYMENT",
                title: "Payment Rejected",
                message: "Your payment request has been rejected.",
            },
        ], { session });
        if (existing.actorId.email && existing.year) {
            const { subject, html, text } = (0, paymentRejectedTemplate_1.paymentRejectedTemplate)(existing.actorId?.fullName, existing.year, message);
            (0, emailHelper_1.sendMail)({ to: existing.actorId.email, subject, html, text });
        }
        // sent email to notify
        await session.commitTransaction();
        return {
            _id: notifyPayment._id,
            year: notifyPayment.year,
            notifyPaymentStatus: notifyPayment.status,
            actorPaymentStatus: actorPayment.status,
        };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
};
exports.ActorPaymentService = {
    actorPaymentInfo,
    notifyActorForPayment,
    fetchNotifyPayments,
    paymentSubmitted,
    fetchActorPayments,
    verifyActorPayment,
    getPaymentDashboardStats,
    getMergedPaymentsFromDB,
    recordActorPayment,
    yearlyActorPaymentStats,
    actorPaymentHistory,
    getPaymentReportCursor,
    actorUnpaidYearList,
    generateMemberShipBilling,
    getYearlyActorPaymentStatus,
    rejectActorPayment,
};
