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
exports.BeAMemberPaymentService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const error_1 = require("../middleware/error");
const payment_schema_1 = require("./payment.schema");
const beAMember_schema_1 = __importDefault(require("../beAMember/beAMember.schema"));
const notification_schema_1 = require("../notification/notification.schema");
const emailHelper_1 = require("../helper/emailHelper");
const paymentVarificaion_1 = require("../helper/mailTempate/paymentVarificaion");
const BE_A_MEMBER_TYPES = [
    "BE_A_MEMBER",
    "PAYMENT_SUBMITTED",
    "APPLICATION_APPROVED",
    "APPLICATION_REJECTED",
];
/* ------------------------------------
   CREATE BE A MEMBER
------------------------------------- */
const getBeAMemberPayments = async ({ limit, skip, sortBy = "createdAt", sortOrder = -1, }) => {
    const [beAMemberPayments, total] = await Promise.all([
        payment_schema_1.Payment.find({})
            .populate("beAMember", "fullName")
            .limit(limit)
            .skip(skip)
            .sort({ [sortBy]: sortOrder }),
        payment_schema_1.Payment.countDocuments(),
    ]);
    if (!beAMemberPayments) {
        throw new error_1.AppError(400, "Be a Member entry not created");
    }
    const totalPages = Math.floor(total / limit);
    return { beAMemberPayments, totalPages };
};
const verifyPayment = async ({ paymentId, status, adminId, rejectionReason, message, }) => {
    console.log(paymentId, status, adminId, rejectionReason, message);
    const session = await mongoose_1.default.startSession();
    try {
        let updatedPayment;
        await session.withTransaction(async () => {
            const application = await beAMember_schema_1.default.findOne({
                payment: new mongoose_1.Types.ObjectId(paymentId)
            }).session(session);
            if (!application) {
                throw new error_1.AppError(404, "Application not found");
            }
            // 1️⃣ Update Payment
            updatedPayment = await payment_schema_1.Payment.findOneAndUpdate({ beAMember: application._id }, {
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
            // 2️⃣ Update Notification
            await notification_schema_1.Notification.findOneAndUpdate({
                application: application._id,
                type: "PAYMENT_SUBMITTED",
            }, {
                $set: {
                    isRead: true,
                },
            }, { session });
            // 3️⃣ Send Mail
            const { subject, html, text } = (0, paymentVarificaion_1.paymentVerifiedTemplate)(application.fullName, message);
            (0, emailHelper_1.sendMail)({
                to: application.email,
                subject,
                text,
                html,
            });
        });
        return updatedPayment;
    }
    finally {
        session.endSession();
    }
};
/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
exports.BeAMemberPaymentService = {
    getBeAMemberPayments,
    verifyPayment
};
