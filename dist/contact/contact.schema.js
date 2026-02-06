"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUs = void 0;
const mongoose_1 = require("mongoose");
const ContactSchema = new mongoose_1.Schema({
    name: { type: String, trim: true, maxlength: 120, default: "" },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        maxlength: 254,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        index: true,
    },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
        minlength: [2, "Message is too short"],
        maxlength: [2000, "Message is too long"],
    },
    status: {
        type: String,
        enum: ["new", "read", "replied", "archived"],
        default: "new",
        index: true,
    },
}, { timestamps: true });
exports.ContactUs = (0, mongoose_1.model)("ContactUs", ContactSchema);
