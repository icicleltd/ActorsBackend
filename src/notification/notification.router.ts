import express from "express";
import { NotificationController } from "./notification.controller";
import { fileUploader } from "../helper/fileUpload";
const notificationRouter = express.Router();
notificationRouter.post( "/",NotificationController.createNotification);
notificationRouter.get('/',NotificationController.getNotification);
notificationRouter.get('/admin/:id',NotificationController.getAdminNotification);
notificationRouter.put('/:id/read',NotificationController.readNotificaton)
export default notificationRouter;
