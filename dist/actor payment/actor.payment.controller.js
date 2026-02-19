"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorPaymentController = void 0;
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const actor_payment_services_1 = require("./actor.payment.services");
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const actorPaymentInfo = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.query.id;
    const search = req.query.search;
    const alive = req.query.alive;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || "createdAt";
    const sortWith = req.query.sortWith === "asc" ? 1 : -1;
    const year = parseInt(req.query.year);
    const status = req.query.status || "pending";
    const result = await actor_payment_services_1.ActorPaymentService.actorPaymentInfo(id, search, limit, sortBy, sortWith, alive, year, status);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Actor get successfully",
        data: result,
    });
});
const notifyActorForPayment = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const result = await actor_payment_services_1.ActorPaymentService.notifyActorForPayment(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notify payment successfully",
        data: result,
    });
});
const fetchNotifyPayments = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.query.uid;
    const result = await actor_payment_services_1.ActorPaymentService.fetchNotifyPayments(idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Fetch Notify payment successfully",
        data: result,
    });
});
const paymentSubmitted = (0, catchAsync_1.default)(async (req, res, next) => {
    const { notifyPaymentId, senderNumber, transactionId, type, year, amount } = req.body;
    const actorId = req.user.data._id;
    const result = await actor_payment_services_1.ActorPaymentService.paymentSubmitted(senderNumber, transactionId, notifyPaymentId, actorId, type, year, amount);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Payment submitted successfully",
        data: result,
    });
});
const fetchActorPayments = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.query.uid;
    const result = await actor_payment_services_1.ActorPaymentService.fetchActorPayments(idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Fetch Notify payment successfully",
        data: result,
    });
});
const verifyActorPayment = (0, catchAsync_1.default)(async (req, res, next) => {
    const { paymentId, notifyPayment } = req.body;
    const result = await actor_payment_services_1.ActorPaymentService.verifyActorPayment(paymentId, notifyPayment);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Payment verify successfully",
        data: result,
    });
});
exports.ActorPaymentController = {
    actorPaymentInfo,
    notifyActorForPayment,
    fetchNotifyPayments,
    paymentSubmitted,
    fetchActorPayments,
    verifyActorPayment,
};
