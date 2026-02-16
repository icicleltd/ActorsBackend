import express from "express";
import { EventController } from "./event.controller";
import { fileUploader } from "../helper/fileUpload";

const router = express.Router();

// router.post("/upcomming", EventController.createEvent);
router.post(
  "/",
  // fileUploader.upload.fields([
  //   { name: "banner", maxCount: 1 },
  //   { name: "logo", maxCount: 1 },
  //   { name: "images", maxCount: 20 },
  // ]),
  EventController.createEvent
);
router.get("/", EventController.getEvents);
router.get("/:id", EventController.getAdminEvents);
router.put("/:id/read", EventController.readEvent);
router.put(
  "/:id",
  fileUploader.upload.fields([
    { name: "images", maxCount: 20 },
  ]),
  EventController.updateEvent
);
router.delete("/:id", EventController.deleteEvent);

export default router;
