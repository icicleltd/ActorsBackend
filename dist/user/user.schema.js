"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_interface_1 = require("./user.interface");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: user_interface_1.USER_ROLES,
        default: "admin",
        required: true,
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
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password)
        return;
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt_1.default.compare(plainPassword, this.password);
};
exports.User = (0, mongoose_1.model)("User", userSchema);
