"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    // Link payment to application (NOT user)
    beAMember: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "BeAMember",
        required: true,
        unique: true,
    },
    method: {
        type: String,
        enum: ["bkash"],
        default: "bkash",
    },
    // Applicant’s bKash number
    senderNumber: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
    },
    verifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
    },
    verifiedAt: {
        type: Date,
        default: null,
    },
    rejectionReason: String,
}, { timestamps: true });
exports.Payment = (0, mongoose_1.model)("Payment", paymentSchema);
