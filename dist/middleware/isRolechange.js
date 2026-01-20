"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRoleChange = void 0;
const jwtHelper_1 = require("../helper/jwtHelper");
const error_1 = require("./error");
const isRoleChange = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // ✅ Guest access allowed
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new error_1.AppError(401, "Unauthorized");
        }
        const accessToken = authHeader.split(" ")[1];
        const data = jwtHelper_1.jwtHelper.verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        req.user = data; // attach user if valid
        return next();
    }
    catch (error) {
        console.warn("Token invalid or expired, continuing as guest");
        return next(error);
    }
};
exports.isRoleChange = isRoleChange;
