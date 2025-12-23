"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_controller_1 = require("./event.controller");
const router = express_1.default.Router();
router.post("/", event_controller_1.EventController.createEvent);
router.get("/", event_controller_1.EventController.getEvents);
router.get("/:id", event_controller_1.EventController.getAdminEvents);
router.put("/:id/read", event_controller_1.EventController.readEvent);
exports.default = router;
