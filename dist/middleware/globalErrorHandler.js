"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const globalErrorHandler = (error, req, res, next) => {
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
