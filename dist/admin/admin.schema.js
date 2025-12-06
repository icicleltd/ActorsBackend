"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: "",
    },
    avatar: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["admin", "moderator", "superadmin"],
        default: "admin",
    },
    // permissions: {
    //   type: [String],
    //   default: [],
    // },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
exports.Admin = (0, mongoose_1.model)("Admin", adminSchema);
