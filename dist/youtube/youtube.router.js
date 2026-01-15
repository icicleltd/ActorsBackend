"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const youtube_controller_1 = require("./youtube.controller");
const router = express_1.default.Router();
router.post("/", youtube_controller_1.YoutubeController.createYoutbe);
router.get("/", youtube_controller_1.YoutubeController.getYoutube);
router.delete("/:id", youtube_controller_1.YoutubeController.deleteYoutube);
exports.default = router;
