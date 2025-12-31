"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    details: {
        type: String,
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
        // required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
eventSchema.virtual("remainingDays").get(function () {
    if (!this.eventDate)
        return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(this.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
eventSchema.virtual("eventType").get(function () {
    return this.eventDate > new Date() ? "UPCOMING" : "PAST";
});
exports.Event = (0, mongoose_1.model)("Event", eventSchema);
