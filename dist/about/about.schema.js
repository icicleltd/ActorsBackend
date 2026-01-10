"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.About = void 0;
const mongoose_1 = require("mongoose");
const pointSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: true });
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
    points: [
        {
            point: {
                type: String,
                required: true,
                trim: true,
            },
        },
    ],
    images: [
        {
            year: {
                type: String,
                required: true,
                trim: true,
            },
            image: {
                type: String,
                required: true,
            },
            publicId: {
                type: String,
                required: false,
            },
        },
    ],
}, { timestamps: true });
exports.About = (0, mongoose_1.model)("About", aboutSchema);
