"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notification_constant_1 = require("./notification.constant");
const notificationSchema = new mongoose_1.Schema({
    recipientRole: {
        type: [String],
        enum: notification_constant_1.RECIPIENT_ROLES,
        required: true,
    },
    contact: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Contact",
        required: false,
    },
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Actor",
    },
    type: {
        type: String,
        enum: notification_constant_1.NOTIFICATION_TYPES,
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    application: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "BeAMember",
        required: false,
    },
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
// Index for fast inbox
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1 });
exports.Notification = (0, mongoose_1.model)("Notification", notificationSchema);
