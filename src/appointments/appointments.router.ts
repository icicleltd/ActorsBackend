import express from "express";
import { fileUploader } from "../helper/fileUpload";
import { ScheduleController } from "./appointments.controller";
import { VerifyLogin } from "../middleware/verifyLogin";

const router = express.Router();

/**
 * Create / Update Schedule
 * image + title + description (multipart/form-data)
 */
router.post(
  "/",
  fileUploader.upload.array("pdf"),
  ScheduleController.createSchedule
);

/**
 * Get all schedules (sorted)
 */
router.get("/report", VerifyLogin,ScheduleController.getMyMonthlyApprovedSchedules);
router.get("/", ScheduleController.getSchedules);

router.put("/reorder", ScheduleController.reorderSchedules);
router.put("/:id",VerifyLogin, ScheduleController.approve);

export default router;
