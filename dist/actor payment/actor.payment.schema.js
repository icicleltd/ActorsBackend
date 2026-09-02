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
        required: function () {
            return this.type === "membership";
        },
    },
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Event",
        required: function () {
            return this.type === "event";
        },
    },
    number: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        trim: true,
    },
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
        default: "verified",
    },
    verifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    verifiedAt: { type: Date, required: true, default: Date.now },
    note: String,
}, { timestamps: true });
// Prevent duplicate yearly membership payment
actorPaymentSchema.index({ actor: 1, type: 1, year: 1 }, { unique: true, partialFilterExpression: { type: "membership" } });
actorPaymentSchema.index({ actor: 1, type: 1, eventId: 1 }, { unique: true, partialFilterExpression: { type: "event" } });
actorPaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
const ActorPayment = (0, mongoose_1.model)("ActorPayment", actorPaymentSchema);
exports.default = ActorPayment;
const NotifyPaymentSchema = new mongoose_1.Schema({
    actorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Actor",
        required: true,
    },
    type: {
        type: String,
        enum: ["membership", "event"],
        default: "membership",
        required: true,
    },
    year: {
        type: Number,
        required: function () {
            return (this.type = "membership");
        },
    },
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Event",
        required: function () {
            return this.type === "event";
        },
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
    desc: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["request", "paid"],
        default: "request",
    },
    rejectionReason: { type: String, trim: true },
    isView: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Block duplicate PENDING requests for the same membership year
NotifyPaymentSchema.index({ actorId: 1, type: 1, year: 1 }, {
    unique: true,
    partialFilterExpression: { type: "membership", status: "request" },
});
// Block duplicate PENDING requests for the same event
NotifyPaymentSchema.index({ actorId: 1, type: 1, eventId: 1 }, {
    unique: true,
    partialFilterExpression: { type: "event", status: "request" },
});
exports.NotifyPayment = (0, mongoose_1.model)("NotifyPayment", NotifyPaymentSchema);
