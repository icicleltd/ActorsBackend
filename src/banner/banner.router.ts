import express from "express";
import { fileUploader } from "../helper/fileUpload";
import { BannerController } from "./banner.controller";

const router = express.Router();

/**
 * Create banner
 * image + title + subtitle (multipart/form-data)
 */
router.post(
  "/",
  fileUploader.upload.single("image"),
  BannerController.createBanner
);

/**
 * Get all banners (sorted by order)
 */
router.get("/", BannerController.getBanners);

/**
 * Delete single banner
 */
router.delete("/:id", BannerController.deleteBanner);

/**
 * Delete all banners
 */
router.delete("/", BannerController.deleteAllBanners);

/**
 * Reorder banners (drag & drop)
 */
router.put("/reorder", BannerController.reorderBanners);

export default router;
