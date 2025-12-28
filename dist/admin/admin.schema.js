"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const adminSchema = new mongoose_1.Schema({
    fullName: {
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
        select: false,
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
adminSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password)
        return;
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
adminSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt_1.default.compare(plainPassword, this.password);
};
exports.Admin = (0, mongoose_1.model)("Admin", adminSchema);
