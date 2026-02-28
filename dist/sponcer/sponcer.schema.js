"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sponcer = void 0;
const mongoose_1 = require("mongoose");
const sponcerSchema = new mongoose_1.Schema({
    url: {
        type: String,
        trim: true,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    terms: {
        type: String,
        trim: true,
        required: true,
    },
    discount: {
        type: String,
        trim: true,
        required: true,
    },
    validity: {
        type: String,
        trim: true,
        required: true,
    },
}, {
    timestamps: true,
});
exports.Sponcer = (0, mongoose_1.model)("Sponcer", sponcerSchema);
