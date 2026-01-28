"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const verifyLogin_1 = require("../middleware/verifyLogin");
const notificationRouter = express_1.default.Router();
notificationRouter.post("/", notification_controller_1.NotificationController.createNotification);
notificationRouter.get("/unread-count", verifyLogin_1.VerifyLogin, notification_controller_1.NotificationController.unReadCountNotification);
notificationRouter.get('/all', notification_controller_1.NotificationController.allNo);
notificationRouter.get("/unread", verifyLogin_1.VerifyLogin, notification_controller_1.NotificationController.unReadNotification);
notificationRouter.get("/", verifyLogin_1.VerifyLogin, notification_controller_1.NotificationController.getNotification);
notificationRouter.get("/admin/:id", notification_controller_1.NotificationController.getAdminNotification);
notificationRouter.put("/read", verifyLogin_1.VerifyLogin, notification_controller_1.NotificationController.readNotification);
exports.default = notificationRouter;
