"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    logo: String,
    banner: String,
    images: {
        type: [String],
        default: [],
    },
    eventDate: {
        type: Date,
        required: true,
    },
    isBookingOpen: {
        type: Boolean,
        default: false,
    },
    // ONLY COUNT
    registrationCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
