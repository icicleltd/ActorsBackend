"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gallery = void 0;
const mongoose_1 = require("mongoose");
const gallerySchema = new mongoose_1.Schema({
    image: {
        type: String,
        required: true,
        trim: true,
    },
    publicId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
exports.Gallery = (0, mongoose_1.model)("Gallery", gallerySchema);
