"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyPayment = void 0;
const mongoose_1 = require("mongoose");
const actorPaymentSchema = new mongoose_1.Schema({
    actor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Actor",
        required: true,
        index: true,
    },
    notifyPayment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "NotifyPayment",
        required: true,
    },
    type: {
        type: String,
        enum: ["membership", "event"],
        default: "membership",
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        trim: true,
    },
    eventName: String,
    amount: {
        type: Number,
        required: true,
    },
    method: {
        type: String,
        enum: ["bkash", "Nagad", "Cash"],
        default: "bkash",
        required: true,
    },
    transactionId: String,
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
    },
    verifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
    },
    verifiedAt: Date,
    note: String,
}, { timestamps: true });
// Prevent duplicate yearly membership payment
actorPaymentSchema.index({ actor: 1, type: 1, year: 1 }, { unique: true, partialFilterExpression: { type: "membership" } });
const ActorPayment = (0, mongoose_1.model)("ActorPayment", actorPaymentSchema);
exports.default = ActorPayment;
const NotifyPaymentSchema = new mongoose_1.Schema({
    actorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Actor",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    number: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["request", "paid"],
        default: "request",
    },
    desc: {
        type: String,
        trim: true,
    },
    isView: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.NotifyPayment = (0, mongoose_1.model)("NotifyPayment", NotifyPaymentSchema);
