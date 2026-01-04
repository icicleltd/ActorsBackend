"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaDirectory = void 0;
const mongoose_1 = require("mongoose");
const mediaDirectorySchema = new mongoose_1.Schema({
    houseName: {
        type: String,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    mediaRole: {
        type: String,
        enum: [
            "producer",
            "director",
            "script_writer",
            "dop",
            "makeup_artist",
            "shooting_house",
            "tv_channel",
            "finance_and_contract",
        ],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true,
    },
}, {
    timestamps: true,
});
exports.MediaDirectory = (0, mongoose_1.model)("MediaDirectory", mediaDirectorySchema);
