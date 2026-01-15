"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Youtube = void 0;
const mongoose_1 = require("mongoose");
const youtubeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        trim: true,
    },
    url: {
        type: String,
        trim: true,
        required: true,
    },
}, {
    timestamps: true,
});
exports.Youtube = (0, mongoose_1.model)("Youtube", youtubeSchema);
