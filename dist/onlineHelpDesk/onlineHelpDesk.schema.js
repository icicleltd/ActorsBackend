"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpDesk = void 0;
const mongoose_1 = require("mongoose");
const helpDeskSchema = new mongoose_1.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    file: {
        type: String,
    },
    status: {
        type: String,
        enum: ["open", "pending", "resolved"],
        default: "open",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Actor",
        required: true,
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
    },
    targetRole: {
        type: String,
        enum: ["single_actor", "executive_member", "advisor_member", "all"],
        default: "single_actor",
    },
    adminReply: {
        type: String,
    },
}, { timestamps: true });
exports.HelpDesk = (0, mongoose_1.model)("HelpDesk", helpDeskSchema);
