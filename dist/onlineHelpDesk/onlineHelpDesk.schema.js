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
    messages: [
        {
            sender: {
                type: mongoose_1.Schema.Types.ObjectId,
                required: true,
                refPath: "messages.senderModel",
            },
            senderModel: {
                type: String,
                enum: ["Actor", "Admin"],
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
            file: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
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
    targetRoleReply: [
        {
            actorId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Actor",
            },
            actorReply: String,
        },
    ],
    targetActorIds: [
        {
            actorId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Actor",
            },
            isMemberRead: {
                type: Boolean,
                default: false,
            },
        },
    ],
    targetRole: {
        type: String,
        enum: ["actor", "executive_member", "advisor_member", "all"],
        default: "actor",
    },
    adminReply: {
        type: String,
    },
    isAdminRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.HelpDesk = (0, mongoose_1.model)("HelpDesk", helpDeskSchema);
