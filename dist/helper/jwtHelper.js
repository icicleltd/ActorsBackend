"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelper = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../middleware/error");
const generateToken = (payload, secret, expiresIn) => {
    try {
        return jsonwebtoken_1.default.sign(payload, secret, {
            algorithm: "HS256",
            expiresIn,
        });
    }
    catch (error) {
        throw new error_1.AppError(500, "Failed to generate token");
    }
};
const verifyToken = (token, secret) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new error_1.AppError(401, "Unauthorized access: Invalid or expired token");
    }
};
exports.jwtHelper = { generateToken, verifyToken };
