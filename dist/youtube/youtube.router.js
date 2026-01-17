"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verifyAdmin_1 = require("./../middleware/verifyAdmin");
const express_1 = __importDefault(require("express"));
const youtube_controller_1 = require("./youtube.controller");
const verifyLogin_1 = require("../middleware/verifyLogin");
const router = express_1.default.Router();
router.post("/", verifyLogin_1.VerifyLogin, verifyAdmin_1.VerifyAdmin, youtube_controller_1.YoutubeController.createYoutbe);
router.get("/", youtube_controller_1.YoutubeController.getYoutube);
router.delete("/:id", verifyLogin_1.VerifyLogin, verifyAdmin_1.VerifyAdmin, youtube_controller_1.YoutubeController.deleteYoutube);
exports.default = router;
