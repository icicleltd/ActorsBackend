"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const notification_services_1 = require("./notification.services");
const createNotification = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await notification_services_1.NotificationService.createNotification();
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Notification created successfully",
        data: result,
    });
});
const getNotification = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await notification_services_1.NotificationService.getNotification();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notification fetched successfully",
        data: result,
    });
});
const getAdminNotification = (0, catchAsync_1.default)(async (req, res, next) => {
    const adminId = req.params.id;
    const result = await notification_services_1.NotificationService.getAdminNotification(adminId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Notification fetched successfully",
        data: result,
    });
});
const readNotificaton = (0, catchAsync_1.default)(async (req, res, next) => {
    const notificatinId = req.params.id;
    const result = await notification_services_1.NotificationService.readNotification(notificatinId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "updated successfully",
        data: result,
    });
});
exports.NotificationController = {
    createNotification,
    getNotification,
    getAdminNotification,
    readNotificaton,
};
