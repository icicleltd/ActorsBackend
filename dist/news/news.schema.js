"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.News = void 0;
const mongoose_1 = require("mongoose");
const newsSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    published: {
        type: Date,
        required: true,
    },
    link: {
        type: String,
        // required: true,
    },
}, {
    timestamps: true,
});
exports.News = (0, mongoose_1.model)("News", newsSchema);
