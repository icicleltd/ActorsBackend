import express from "express";
import { fileUploader } from "../helper/fileUpload";
import { ScheduleController } from "./appointments.controller";

const router = express.Router();

/**
 * Create / Update Schedule
 * image + title + description (multipart/form-data)
 */
router.post(
  "/",
  fileUploader.upload.single("image"),
  ScheduleController.createSchedule
);

/**
 * Get all schedules (sorted)
 */
router.get("/", ScheduleController.getSchedules);

/**
 * Delete single schedule
 */
// router.delete("/:id", ScheduleController.deleteSchedule);

/**
 * Delete all schedules
 */
// router.delete("/", ScheduleController.deleteAllSchedules);

/**
 * Reorder schedules (drag & drop)
 */
router.put("/reorder", ScheduleController.reorderSchedules);

export default router;
