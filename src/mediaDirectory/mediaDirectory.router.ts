import express from "express";
import { MediaDirectoryController } from "./mediaDirectory.controller";
import { fileUploader } from "../helper/fileUpload";
import { VerifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();
// router.post("/upcomming", EventController.createEvent);
router.post("/",VerifyAdmin, MediaDirectoryController.createMediaDirectory);
router.get("/", MediaDirectoryController.getMediaDirectory);
router.put("/:id",VerifyAdmin, MediaDirectoryController.updateMediaDirectory);
router.delete("/:id",VerifyAdmin, MediaDirectoryController.deleteMediaDirectory);
// router.get("/:id", EventController.getAdminEvents);
// router.put("/:id/read", EventController.readEvent);

export default router;
