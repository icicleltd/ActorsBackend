"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeAMemberPaymentController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const payment_services_1 = require("./payment.services");
/* ------------------------------------
   CREATE BE A MEMBER (Admin)
------------------------------------- */
const getBeAMemberPayments = (0, catchAsync_1.default)(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const result = await payment_services_1.BeAMemberPaymentService.getBeAMemberPayments({
        limit,
        skip,
        sortBy,
        sortOrder,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Be a Member payment get successfully",
        data: result,
    });
});
const verifyPayment = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason, message } = req.body;
    const adminId = req.user._id;
    const result = await payment_services_1.BeAMemberPaymentService.verifyPayment({
        paymentId: id,
        status,
        rejectionReason,
        adminId,
        message,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admin Approved successfully",
        data: result,
    });
});
/* ------------------------------------
   EXPORT CONTROLLER
------------------------------------- */
exports.BeAMemberPaymentController = {
    getBeAMemberPayments,
    verifyPayment,
};
