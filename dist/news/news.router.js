"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const news_controller_1 = require("./news.controller");
const router = express_1.default.Router();
router.post("/", 
// fileUploader.upload.single("image"),
news_controller_1.NewsController.createNews);
router.put("/:id", 
// fileUploader.upload.single("image"),
news_controller_1.NewsController.editNews);
router.get("/", news_controller_1.NewsController.getAllNews);
router.get("/:id", news_controller_1.NewsController.getSingleNews);
router.delete("/:id", news_controller_1.NewsController.deleteNews);
exports.default = router;
