import express from "express";
import { AdminController } from "./admin.controller";
import { fileUploader } from "../helper/fileUpload";
const adminRouter = express.Router();
adminRouter.post("/", AdminController.createAdmin);
adminRouter.post(
  "/add-actor",
  fileUploader.upload.single("photo"),
  AdminController.addActor
);
adminRouter.put("/:id", AdminController.updateActorProfile);
adminRouter.get("/", AdminController.getAdmin);
adminRouter.put("/:id", AdminController.readNotificaton);
export default adminRouter;
