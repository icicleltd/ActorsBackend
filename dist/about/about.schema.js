"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.About = void 0;
const mongoose_1 = require("mongoose");
const aboutSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    points: {
        type: [String],
        default: [],
    },
    images: [
        {
            year: {
                type: String,
                required: true,
                trim: true,
            },
            src: {
                type: String,
                required: true,
            },
        },
    ],
}, {
    timestamps: true,
});
exports.About = (0, mongoose_1.model)("About", aboutSchema);
