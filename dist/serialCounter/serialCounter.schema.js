"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Counter = void 0;
const mongoose_1 = require("mongoose");
const counterSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    seq: {
        type: Number,
        required: true,
        default: 1000,
    },
}, {
    timestamps: true,
});
exports.Counter = (0, mongoose_1.model)("Counter", counterSchema);
