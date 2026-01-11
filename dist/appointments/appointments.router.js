"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../helper/fileUpload");
const appointments_controller_1 = require("./appointments.controller");
const router = express_1.default.Router();
/**
 * Create / Update Schedule
 * image + title + description (multipart/form-data)
 */
router.post("/", fileUpload_1.fileUploader.upload.array("pdf"), appointments_controller_1.ScheduleController.createSchedule);
/**
 * Get all schedules (sorted)
 */
router.get("/", appointments_controller_1.ScheduleController.getSchedules);
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
router.put("/reorder", appointments_controller_1.ScheduleController.reorderSchedules);
exports.default = router;
