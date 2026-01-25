import express from "express";
import { NotificationController } from "./notification.controller";
import { fileUploader } from "../helper/fileUpload";
import { VerifyLogin } from "../middleware/verifyLogin";
import { VerifyAdmin } from "../middleware/verifyAdmin";
const notificationRouter = express.Router();
notificationRouter.post("/", NotificationController.createNotification);
notificationRouter.get(
  "/unread-count",
  VerifyLogin,
  NotificationController.unReadCountNotification,
);
notificationRouter.get("/",VerifyLogin, NotificationController.getNotification);
notificationRouter.get(
  "/admin/:id",
  NotificationController.getAdminNotification,
);
notificationRouter.put(
  "/read",
  VerifyLogin,
  NotificationController.readNotificaton,
);
export default notificationRouter;
