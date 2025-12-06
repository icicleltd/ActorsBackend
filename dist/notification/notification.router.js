"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const notificationRouter = express_1.default.Router();
notificationRouter.post("/", notification_controller_1.NotificationController.createNotification);
notificationRouter.get('/', notification_controller_1.NotificationController.getNotification);
notificationRouter.get('/admin/:id', notification_controller_1.NotificationController.getAdminNotification);
notificationRouter.put('/:id/read', notification_controller_1.NotificationController.readNotificaton);
exports.default = notificationRouter;
