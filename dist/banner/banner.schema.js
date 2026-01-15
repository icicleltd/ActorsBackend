"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = require("mongoose");
const bannerSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true,
    },
    publicId: {
        type: String,
    },
    order: {
        type: Number,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});
exports.Banner = (0, mongoose_1.model)("Banner", bannerSchema);
