"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const auth_services_1 = require("./auth.services");
const cookieHelper_1 = __importDefault(require("../helper/cookieHelper"));
const createAuth = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const otp = req.query.otp;
    const result = await auth_services_1.AuthService.createAuth(payload, otp);
    (0, cookieHelper_1.default)(res, "accessToken", result.accessToken, Number(process.env.ACCESS_COOKIE_EXPIRE_IN));
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Auth created successfully",
        data: result,
    });
});
const getAuths = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user;
    const result = await auth_services_1.AuthService.getAuths(user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Auths fetched successfully",
        data: result,
    });
});
const getAdminAuths = (0, catchAsync_1.default)(async (req, res, next) => {
    const adminId = req.params.id;
    const result = await auth_services_1.AuthService.getAdminAuths(adminId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admin auths fetched successfully",
        data: result,
    });
});
const readAuth = (0, catchAsync_1.default)(async (req, res, next) => {
    const authId = req.params.id;
    const result = await auth_services_1.AuthService.readAuth(authId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Auth updated successfully",
        data: result,
    });
});
const createOTP = (0, catchAsync_1.default)(async (req, res, next) => {
    const { idNo, email } = req.body;
    const result = await auth_services_1.AuthService.createOTP(idNo, email);
    console.log(result);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `OTP sent successfully. Please check your email (${result.email})`,
        data: result,
    });
});
const updatePassword = (0, catchAsync_1.default)(async (req, res, next) => {
    const { idNo, newPassword } = req.body;
    const result = await auth_services_1.AuthService.updatePassword(idNo, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Password updated successfully",
        data: result,
    });
});
exports.AuthController = {
    createAuth,
    getAuths,
    getAdminAuths,
    readAuth,
    createOTP,
    updatePassword,
};
