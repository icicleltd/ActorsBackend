"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../helper/fileUpload");
const galary_controller_1 = require("./galary.controller");
const router = express_1.default.Router();
router.post("/", fileUpload_1.fileUploader.upload.fields([{ name: "images", maxCount: 20 }]), galary_controller_1.GalleryController.createGalleryImages);
router.get("/", galary_controller_1.GalleryController.getGalleryImages);
router.delete("/:id", galary_controller_1.GalleryController.deleteGalleryImage);
router.delete("/", galary_controller_1.GalleryController.deleteAllGalleryImages);
exports.default = router;
