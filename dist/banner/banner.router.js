"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const banner_controller_1 = require("./banner.controller");
const router = express_1.default.Router();
/**
 * Create banner
 * image + title + subtitle (multipart/form-data)
 */
router.post("/", banner_controller_1.BannerController.createBanner);
/**
 * Get all banners (sorted by order)
 */
router.get("/", banner_controller_1.BannerController.getBanners);
/**
 * Delete single banner
 */
router.delete("/:id", banner_controller_1.BannerController.deleteBanner);
/**
 * Delete all banners
 */
router.delete("/", banner_controller_1.BannerController.deleteAllBanners);
/**
 * Reorder banners (drag & drop)
 */
router.put("/reorder", banner_controller_1.BannerController.reorderBanners);
exports.default = router;
