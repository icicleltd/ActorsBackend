"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const globalErrorHandler = (error, req, res, next) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        error = new error_1.AppError(409, `${field} "${value}" already exists. Please use a different one.`);
    }
    // 🔴 Mongoose validation error
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        error = new error_1.AppError(400, messages.join(", "));
    }
    // 🔴 CastError (invalid ObjectId)
    if (error.name === "CastError") {
        error = new error_1.AppError(400, `Invalid ${error.path}: ${error.value}`);
    }
    // Check if error is an AppError
    if (error instanceof error_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    res.status(500).json({
        success: false,
        message: error?.message || "Something went wrong",
        error: error,
    });
};
exports.default = globalErrorHandler;
