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
const payment_schema_1 = require("../payment/payment.schema");
const actorJoin_1 = require("../helper/actorJoin");
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
            await actor_payment_schema_1.default.create([
                {
                    actor: actorId,
                    notifyPayment: updateNotifyPayment._id,
                    type,
                    year: Number(year),
                    amount: Number(amount),
                    desc: updateNotifyPayment.desc,
                    number: isBkash ? senderNumber : "",
                    transactionId: isBkash ? transactionId : "",
                    bankName: isBank ? bankName : "",
                    accountNo: isBank ? accountNo : "",
                    date: isBank ? new Date(date?.toString()) : "",
                    method,
                    status: "pending",
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
    /* =====================================
       🎯 PAID AMOUNT
    ====================================== */
    const amountResult = await actor_payment_schema_1.default.aggregate([
        { $match: { year, type: "membership" } },
        {
            $facet: {
                verified: [
                    { $match: { status: { $in: ["verified"] } } },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$amount" },
                            count: { $sum: 1 },
                        },
                    },
                ],
                pending: [
                    { $match: { status: { $in: ["pending"] } } },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$amount" },
                            count: { $sum: 1 },
                        },
                    },
                ],
            },
        },
    ]);
    const totalPaidAmount = amountResult[0].verified[0]?.totalAmount || 0;
    const needVerifyAmount = amountResult[0].pending[0]?.totalAmount || 0;
    const totalPaidActor = amountResult[0].verified[0]?.count || 0;
    const needVerifyCount = amountResult[0].pending[0]?.count || 0;
    /* =====================================
       🎯 UNPAID ACTORS
    ====================================== */
    const unpaidAmountResult = await actor_payment_schema_1.NotifyPayment.aggregate([
        {
            $match: {
                year: Number(year),
                status: "request",
                type: "membership",
            },
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                actor: { $sum: 1 },
            },
        },
    ]);
    const totalActorUnpaidAmount = unpaidAmountResult[0]?.totalAmount || 0;
    const totalActorUnpaid = unpaidAmountResult[0]?.actor || 0;
    /* =====================================
       🎯 NEW MEMBER PAYMENT
    ====================================== */
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31T23:59:59.999Z`);
    const newMemberData = await payment_schema_1.Payment.aggregate([
        {
            $match: {
                status: "verified",
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: null,
                totalMembers: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
            },
        },
    ]);
    const totalNewMemberPaid = newMemberData.length > 0 ? newMemberData[0].totalMembers : 0;
    const totalNewMemberAmount = newMemberData.length > 0 ? newMemberData[0].totalAmount : 0;
    const totalHandCash = totalPaidAmount + totalNewMemberAmount;
    /* =====================================
       🎯 RETURN
    ====================================== */
    return {
        actor: {
            paid: {
                totalActors: totalPaidActor,
                totalAmount: totalPaidAmount,
            },
            paymentVerifying: {
                totalActors: needVerifyCount,
                totalAmount: needVerifyAmount,
            },
            unpaid: {
                totalActors: totalActorUnpaid,
                totalAmount: totalActorUnpaidAmount,
            },
        },
        newMember: {
            totalMembers: totalNewMemberPaid,
            totalAmount: totalNewMemberAmount,
        },
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
        method: "Cash",
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
        .populate("actorId", "fullName idNo")
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
// export interface ReportFilter {
//   year: number;
//   type: "membership" | "event";
//   status?: "needVerified" | "paid" | "unpaid" | "all";
// }
// const MAX_CLIENT_ROWS = 5000;
// const mapStatus = {
//   needVerified: "pending",
//   paid: "verified",
//   unpaid: "request",
//   all: "all",
// };
// const ACTOR_STATUS_MAP: Record<"needVerified" | "paid", string> = {
//   needVerified: "pending",
//   paid: "verified",
// };
// const getPaymentReportCursor = async (filter: ReportFilter) => {
//   const { status = "all", type, year } = filter;
//   if (status === "unpaid") {
//     return;
//   }
//   if (status === "needVerified" || status === "paid") {
//     return walkActorOnly(type, year, ACTOR_STATUS_MAP[status]);
//   }
//   // return walkCombined(type, year);
//   // const query: Record<string, unknown> = {
//   //   type: filter.type,
//   //   year: filter.year,
//   // };
//   // if (filter.status) {
//   //   const conditionalStatus = mapStatus[filter.status];
//   //   query.status = conditionalStatus;
//   // }
//   // // run the cursor walk and the sum aggregation concurrently — independent queries, no need to wait sequentially
//   // const [walkResult, sumResult] = await Promise.all([
//   //   walkPayments(query),
//   //   ActorPayment.aggregate([
//   //     { $match: query },
//   //     { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
//   //   ]),
//   // ]);
//   // return {
//   //   totalAmount: sumResult[0]?.totalAmount ?? 0, // sum across ALL matching rows, not just returned ones
//   //   ...walkResult,
//   // };
// };
// async function walkActorOnly(
//   type: ReportFilter["type"],
//   year: number,
//   status: string,
// ) {
//   const query = { type, year, status };
//   const [walkResult, sumResult] = await Promise.all([
//     walkPayments(query),
//     ActorPayment.aggregate([
//       { $match: query },
//       { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
//     ]),
//   ]);
//   return { totalAmount: sumResult[0]?.totalAmount ?? 0, ...walkResult };
// }
// async function walkNotifyOnly(type: ReportFilter["type"], year: number) {
//   const query = { type, year, status: "request" };
//   const [walkResult, sumResult] = await Promise.all([
//     walkNotifyPayments(query),
//     NotifyPayment.aggregate([
//       { $match: query },
//       { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
//     ]),
//   ]);
//   return { totalAmount: sumResult[0]?.totalAmount ?? 0, ...walkResult };
// }
// async function walkPayments(query: Record<string, unknown>) {
//   const cursor = ActorPayment.find(query)
//     .select(
//       "actor amount desc status createdAt year method transactionId number type",
//     )
//     .populate("actor", "fullName idNo")
//     .lean()
//     .maxTimeMS(60_000)
//     // .sort({ actorIdNo: 1 })
//     .sort({ createdAt: 1 })
//     .cursor({ batchSize: 1000 });
//   const results: unknown[] = [];
//   let count = 0;
//   let truncated = false;
//   try {
//     for await (const doc of cursor) {
//       count++;
//       if (results.length < MAX_CLIENT_ROWS) {
//         results.push(doc);
//       } else {
//         truncated = true;
//         break;
//       }
//     }
//   } finally {
//     await cursor.close();
//   }
//   return { total: count, returned: results.length, truncated, data: results };
// }
// async function walkNotifyPayments(query: Record<string, unknown>) {
//   const cursor = NotifyPayment.find(query)
//     .select(
//       "actorId amount desc status createdAt year eventId number type transactionId rejectionReason",
//     )
//     .populate("actorId", "fullName idNo")
//     .lean()
//     .maxTimeMS(60_000)
//     .sort({ createdAt: 1 })
//     .cursor({ batchSize: 1000 });
//   const results: unknown[] = [];
//   let count = 0;
//   let truncated = false;
//   try {
//     for await (const doc of cursor) {
//       count++;
//       if (results.length < MAX_CLIENT_ROWS) {
//         const { actorId, ...rest } = doc;
//         results.push({ ...rest, actor: actorId, source: "NotifyPayment" });
//       } else {
//         truncated: true;
//         break;
//       }
//     }
//   } finally {
//     await cursor.close();
//   }
//   return { total: count, returned: results.length, truncated, data: results };
// }
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
};
