"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredString = void 0;
const error_1 = require("../../middleware/error");
const requiredString = (value, fieldName) => {
    if (!value || typeof value !== "string" || !value.trim()) {
        throw new error_1.AppError(400, `${fieldName} is required`);
    }
};
exports.requiredString = requiredString;
