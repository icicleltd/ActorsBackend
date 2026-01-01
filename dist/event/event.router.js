"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_controller_1 = require("./event.controller");
const fileUpload_1 = require("../helper/fileUpload");
const router = express_1.default.Router();
// router.post("/upcomming", EventController.createEvent);
router.post("/", fileUpload_1.fileUploader.upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 20 },
]), event_controller_1.EventController.createEvent);
router.get("/", event_controller_1.EventController.getEvents);
router.get("/:id", event_controller_1.EventController.getAdminEvents);
router.put("/:id/read", event_controller_1.EventController.readEvent);
router.delete("/:id", event_controller_1.EventController.deleteEvent);
exports.default = router;
