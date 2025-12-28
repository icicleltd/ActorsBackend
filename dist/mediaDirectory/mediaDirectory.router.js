"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mediaDirectory_controller_1 = require("./mediaDirectory.controller");
const router = express_1.default.Router();
// router.post("/upcomming", EventController.createEvent);
router.post("/", mediaDirectory_controller_1.MediaDirectoryController.createMediaDirectory);
// router.get("/", EventController.getEvents);
// router.get("/:id", EventController.getAdminEvents);
// router.put("/:id/read", EventController.readEvent);
exports.default = router;
