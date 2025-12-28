import express from "express";
import { MediaDirectoryController } from "./mediaDirectory.controller";
import { fileUploader } from "../helper/fileUpload";

const router = express.Router();
// router.post("/upcomming", EventController.createEvent);
router.post("/", MediaDirectoryController.createMediaDirectory);
// router.get("/", EventController.getEvents);
// router.get("/:id", EventController.getAdminEvents);
// router.put("/:id/read", EventController.readEvent);

export default router;
