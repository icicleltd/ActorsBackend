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
router.post("/", fileUpload_1.fileUploader.upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 20 },
]), about_controller_1.AboutController.createAbout);
/* ------------------------------------
   GET ABOUTS
------------------------------------ */
router.get("/", about_controller_1.AboutController.getAbouts);
/* ------------------------------------
   GET ADMIN ABOUTS
------------------------------------ */
router.get("/:id", about_controller_1.AboutController.getAdminAbouts);
/* ------------------------------------
   READ ABOUT
------------------------------------ */
router.put("/:id/read", about_controller_1.AboutController.readAbout);
/* ------------------------------------
   UPDATE ABOUT
------------------------------------ */
router.put("/:id", fileUpload_1.fileUploader.upload.fields([
    { name: "images", maxCount: 20 },
]), about_controller_1.AboutController.updateAbout);
/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
router.delete("/:id", about_controller_1.AboutController.deleteAbout);
exports.default = router;
