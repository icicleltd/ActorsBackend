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
exports.BeAMemberService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const error_1 = require("../middleware/error");
const beAMember_schema_1 = __importDefault(require("./beAMember.schema"));
const payment_schema_1 = require("../payment/payment.schema");
const notification_schema_1 = require("../notification/notification.schema");
const serialCounter_schema_1 = require("../serialCounter/serialCounter.schema");
const applicationSubmitted_1 = require("../helper/mailTempate/applicationSubmitted");
const emailHelper_1 = require("../helper/emailHelper");
const applicationApproved_1 = require("../helper/mailTempate/applicationApproved");
const BE_A_MEMBER_TYPES = [
    "BE_A_MEMBER",
    "PAYMENT_SUBMITTED",
    "APPLICATION_APPROVED",
    "APPLICATION_REJECTED",
];
/* ------------------------------------
   CREATE BE A MEMBER
------------------------------------- */
const createBeAMember = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "Be a mebmer info required");
    }
    if (!payload.dob) {
        throw new error_1.AppError(400, "Date of birth required");
    }
    const dob = new Date(payload.dob);
    const beAMemberData = {
        ...payload,
        dob,
    };
    delete beAMemberData.bkashNumber;
    delete beAMemberData.transactionId;
    delete beAMemberData.amount;
    // const paymentInfo: PaymentPayload = {
    //   senderNumber: payload.bkashNumber,
    //   transactionId: payload.transactionId,
    //   amount: payload.amount,
    // };
    const session = await mongoose_1.default.startSession();
    try {
        let createdBeAMember = null;
        await session.withTransaction(async () => {
            const [beAMember] = await beAMember_schema_1.default.create([beAMemberData], { session });
            createdBeAMember = beAMember;
            const [payment] = await payment_schema_1.Payment.create([
                {
                    beAMember: beAMember._id,
                    transactionId: payload.transactionId,
                    amount: payload.amount,
                    senderNumber: payload.bkashNumber,
                },
            ], { session });
            await beAMember_schema_1.default.findByIdAndUpdate(beAMember._id, {
                payment: payment._id,
            }, { session });
            const [notification] = await notification_schema_1.Notification.create([
                {
                    recipientRole: ["admin", "superadmin"],
                    type: "PAYMENT_SUBMITTED",
                    title: "New Membership Payment",
                    message: `${beAMember.fullName} submitted a membership payment`,
                    application: beAMember._id,
                    payment: payment._id,
                },
            ], { session });
            if (payload.actorReference?.length) {
                const referenceNotifications = payload.actorReference.map((ref) => ({
                    recipientRole: ["member", "admin", "superadmin"],
                    recipient: new mongoose_1.default.Types.ObjectId(ref.actorId),
                    type: "REFERENCE_REQUEST",
                    title: "Reference Approval Request",
                    message: `${beAMember.fullName} listed you as a reference for Actors Equity membership`,
                    application: beAMember._id,
                }));
                await notification_schema_1.Notification.insertMany(referenceNotifications, { session });
            }
            const counter = await serialCounter_schema_1.Counter.findOneAndUpdate({ name: "be_a_member" }, {
                $inc: { seq: 1 },
            });
            if (!counter) {
                throw new error_1.AppError(500, "Failed to update member counter");
            }
            await notification_schema_1.Notification.create([
                {
                    recipientRole: ["admin", "superadmin"],
                    type: "BE_A_MEMBER",
                    title: "New Membership Application",
                    message: `${beAMember.fullName} submitted a Be A Member application`,
                    application: beAMember._id,
                    payment: payment._id,
                },
            ], { session });
        });
        if (!createdBeAMember) {
            throw new error_1.AppError(500, "Failed to create application");
        }
        const { subject, text, html } = (0, applicationSubmitted_1.applicationSubmittedTemplate)(payload.fullName);
        (0, emailHelper_1.sendMail)({
            to: payload.email,
            subject,
            text,
            html,
        });
        return createdBeAMember;
    }
    catch (error) {
        console.log("be a member tarasation error", error);
        throw new error_1.AppError(400, `${error}`);
    }
    finally {
        session.endSession();
    }
};
/* ------------------------------------
   GET ALL BE A MEMBERS
------------------------------------- */
const getBeAMembersss = async (limit, skip, sortBy, sortWith, id, role) => {
    // ✅ member can only see applications where they are a reference
    if (role === "member") {
        const members = await beAMember_schema_1.default.aggregate([
            { $unwind: "$actorReference" },
            {
                $match: {
                    ["actorReference.actorId"]: new mongoose_1.Types.ObjectId(id),
                },
            },
        ])
            .sort({ [sortBy]: sortWith })
            .limit(limit)
            .skip(skip);
        return members;
    }
    const members = await beAMember_schema_1.default.find()
        .populate({
        path: "actorReference.actorId",
    })
        .populate({
        path: "payment",
        select: "method amount status verifiedAt transactionId senderNumber",
    })
        .sort({ [sortBy]: sortWith })
        .limit(limit)
        .skip(skip);
    return members;
};
const getBeAMemberss = async (limit, skip, sortBy, sortWith, id, role) => {
    const objectId = new mongoose_1.Types.ObjectId(id); // Convert id to ObjectId
    if (role === "member") {
        // Aggregation for member role
        const members = await beAMember_schema_1.default.aggregate([
            {
                $match: {
                    "actorReference.actorId": objectId, // Match documents where actorReference.actorId matches the member id
                },
            },
            {
                $addFields: {
                    actorReference: {
                        $map: {
                            input: "$actorReference", // Iterate over the actorReference array
                            as: "ref",
                            in: {
                                $mergeObjects: [
                                    "$$ref", // Keep all existing fields in actorReference
                                    {
                                        isMatchingReference: {
                                            $eq: ["$$ref.actorId", objectId], // Add a flag if actorId matches the member id
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            // Populate actorReference.actorId
            {
                $lookup: {
                    from: "actors", // The collection name for the actor model
                    localField: "actorReference.actorId",
                    foreignField: "_id",
                    as: "actorReferencePopulated",
                },
            },
            {
                $addFields: {
                    actorReference: {
                        $map: {
                            input: "$actorReference", // Iterate over the actorReference array
                            as: "ref",
                            in: {
                                $mergeObjects: [
                                    "$$ref",
                                    {
                                        actorId: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$actorReferencePopulated",
                                                        as: "populatedRef",
                                                        cond: {
                                                            $eq: ["$$populatedRef._id", "$$ref.actorId"],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            // Remove the temporary populated field
            {
                $unset: "actorReferencePopulated",
            },
            // Populate payment field
            {
                $lookup: {
                    from: "payments", // The collection name for the payment model
                    localField: "payment",
                    foreignField: "_id",
                    as: "payment",
                },
            },
            {
                $sort: { [sortBy]: sortWith }, // Sort by the specified field
            },
            { $skip: skip }, // Skip the first N documents
            { $limit: limit }, // Limit the number of documents returned
        ]);
        return members;
    }
    // For non-member roles, return all applicants with population
    const members = await beAMember_schema_1.default.find()
        .populate({
        path: "actorReference.actorId",
    })
        .populate({
        path: "payment",
        select: "method amount status verifiedAt transactionId senderNumber",
    })
        .sort({ [sortBy]: sortWith })
        .limit(limit)
        .skip(skip);
    return members;
};
const getBeAMembers = async (limit, skip, sortBy, sortWith, id, role) => {
    const query = {}; // Initialize an empty query object
    // If the role is "member", filter by actorReference.actorId
    if (role === "member") {
        query["actorReference.actorId"] = new mongoose_1.Types.ObjectId(id);
    }
    // Perform the query with common logic for both roles
    const members = await beAMember_schema_1.default.find(query)
        .populate({
        path: "actorReference.actorId",
    })
        .populate({
        path: "payment",
        select: "method amount status verifiedAt transactionId senderNumber",
    })
        .sort({ [sortBy]: sortWith })
        .limit(limit)
        .skip(skip);
    return members;
};
const approveByAdmin = async (payload) => {
    const { id, status, adminId, rejectionReason, message } = payload;
    if (!id) {
        throw new error_1.AppError(400, "Be a Member ID is required");
    }
    if (!["approved", "rejected", "pending"].includes(status)) {
        throw new error_1.AppError(400, "Invalid status value");
    }
    const session = await mongoose_1.default.startSession();
    try {
        let updatedBeAMember;
        let updatedPayment;
        await session.withTransaction(async () => {
            // 1️⃣ Fetch application first (status guard)
            const existingBeAMember = await beAMember_schema_1.default.findById(id).session(session);
            if (!existingBeAMember) {
                throw new error_1.AppError(404, "Be A Member application not found");
            }
            if (existingBeAMember.status === status) {
                throw new error_1.AppError(400, `Application is already ${status}`);
            }
            // 2️⃣ Update Be A Member status
            updatedBeAMember = await beAMember_schema_1.default.findByIdAndUpdate(id, { $set: { status, isAdminRead: true } }, { new: true, runValidators: true, session });
            // 3️⃣ Update Payment
            updatedPayment = await payment_schema_1.Payment.findOneAndUpdate({ beAMember: updatedBeAMember._id }, {
                $set: {
                    status: status === "approved" ? "verified" : "rejected",
                    verifiedBy: status === "approved" ? adminId : null,
                    verifiedAt: status === "approved" ? new Date() : null,
                    rejectionReason: status === "rejected" ? rejectionReason : null,
                },
            }, { new: true, session });
            if (!updatedPayment) {
                throw new error_1.AppError(404, "Payment record not found");
            }
            // 4️⃣ UPDATE existing Notification (NO CREATE)
            const updatedNotification = await notification_schema_1.Notification.findOneAndUpdate({
                application: updatedBeAMember._id,
                type: { $in: BE_A_MEMBER_TYPES },
            }, {
                $set: {
                    // recipientRole: ["admin", "superadmin"],
                    // type:
                    //   status === "approved"
                    //     ? "APPLICATION_APPROVED"
                    //     : "APPLICATION_REJECTED",
                    // title:
                    //   status === "approved"
                    //     ? "Membership Application Approved"
                    //     : "Membership Application Rejected",
                    // message:
                    //   status === "approved"
                    //     ? `${updatedBeAMember.fullName}'s membership application has been approved`
                    //     : `${updatedBeAMember.fullName}'s membership application has been rejected`,
                    // payment: updatedPayment._id,
                    isRead: true,
                },
            }, { new: true, session });
            if (!updatedNotification) {
                throw new error_1.AppError(404, "Notification not found for this application");
            }
            const { subject, html, text } = (0, applicationApproved_1.applicationVerifiedTemplate)(existingBeAMember.fullName, message);
            (0, emailHelper_1.sendMail)({
                to: existingBeAMember.email,
                subject,
                text,
                html,
            });
        });
        return {
            success: true,
            message: status === "approved"
                ? "Application approved successfully"
                : "Application rejected successfully",
            data: {
                application: updatedBeAMember,
                payment: updatedPayment,
            },
        };
    }
    catch (error) {
        throw error;
    }
    finally {
        session.endSession();
    }
};
const approveByMember = async (payload) => {
    const { applicantId, actorId, status, notificationType, recipient } = payload;
    if (!applicantId || !actorId) {
        throw new error_1.AppError(400, "BeAMember ID and Actor ID are required");
    }
    if (!["approved", "rejected"].includes(status)) {
        throw new error_1.AppError(400, "Invalid status value");
    }
    const session = await mongoose_1.default.startSession();
    try {
        let updatedBeAMember;
        await session.withTransaction(async () => {
            // 1️⃣ Fetch application
            const existingBeAMember = await beAMember_schema_1.default.findById(applicantId).session(session);
            if (!existingBeAMember) {
                throw new error_1.AppError(404, "Be A Member application not found");
            }
            // 2️⃣ Ensure actorReference exists
            const referenceExists = existingBeAMember.actorReference.some((ref) => ref.actorId.toString() === actorId);
            if (!referenceExists) {
                throw new error_1.AppError(403, "You are not a reference for this application");
            }
            // 3️⃣ Update ONLY this actorReference
            updatedBeAMember = await beAMember_schema_1.default.findByIdAndUpdate(applicantId, {
                $set: {
                    "actorReference.$[elem].status": status,
                    "actorReference.$[elem].isUpdated": true,
                    "actorReference.$[elem].isMemberRead": true,
                    "actorReference.$[elem].respondedAt": new Date(),
                },
            }, {
                new: true,
                session,
                arrayFilters: [
                    { "elem.actorId": new mongoose_1.default.Types.ObjectId(actorId) },
                ],
            });
            await notification_schema_1.Notification.findOneAndUpdate({
                application: new mongoose_1.Types.ObjectId(applicantId),
                recipient: new mongoose_1.Types.ObjectId(recipient),
                type: notificationType,
                // recipientRole: { $in: role },
            }, { $set: { isRead: true } }, { new: true, session });
            // 4️⃣ CREATE new notification (Admin + Superadmin)
            await notification_schema_1.Notification.create([
                {
                    recipientRole: ["admin", "superadmin"],
                    type: status === "approved"
                        ? "APPLICATION_APPROVED"
                        : "APPLICATION_REJECTED",
                    title: status === "approved"
                        ? "Reference Approved successfully"
                        : "Reference Rejected successfully",
                    message: `${updatedBeAMember.fullName}'s reference was ${status}`,
                    application: updatedBeAMember._id,
                    isRead: false,
                },
            ], { session });
        });
        return {
            success: true,
            message: status === "approved"
                ? "Reference approved successfully"
                : "Reference rejected successfully",
            data: updatedBeAMember,
        };
    }
    catch (error) {
        throw error;
    }
    finally {
        session.endSession();
    }
};
/* ------------------------------------
   DELETE SINGLE BE A MEMBER
------------------------------------- */
const deleteBeAMember = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Be a Member ID is required");
    }
    const member = await actor_schema_1.default.findById(id);
    if (!member) {
        throw new error_1.AppError(404, "Be a Member entry not found");
    }
    // If you later store publicId, uncomment this
    // await deleteFromCloudinary(member.publicId);
    await actor_schema_1.default.findByIdAndDelete(id);
    return member;
};
/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
exports.BeAMemberService = {
    createBeAMember,
    getBeAMembers,
    deleteBeAMember,
    approveByAdmin,
    approveByMember,
};
