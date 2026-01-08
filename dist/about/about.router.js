"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const about_controller_1 = require("./about.controller");
const fileUpload_1 = require("../helper/fileUpload");
const router = express_1.default.Router();
/* ------------------------------------
   CREATE ABOUT
------------------------------------ */
router.post("/", fileUpload_1.fileUploader.upload.single("image"), about_controller_1.AboutController.createAbout);
/* ------------------------------------
   GET ABOUTS
------------------------------------ */
router.get("/", about_controller_1.AboutController.getAbouts);
/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
router.delete("/", about_controller_1.AboutController.deleteAbout);
router.put("/", about_controller_1.AboutController.updateAbout);
exports.default = router;
