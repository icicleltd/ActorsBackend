import express from "express";
import { SiteManagementController } from "./siteManagement.controller";

const router = express.Router();

/**
 * Create site Management all module
 */
router.post("/upload-cover-images", SiteManagementController.uploadCoverImages);

/**
 * Get site Management all module
 */
router.get("/", SiteManagementController.getBanners);

/**
 * update site Management all module
 */
router.put("/profile-about/:id", SiteManagementController.updateProfileAbout);
router.put("/profile-performance/:id", SiteManagementController.addProfilePerformance);
router.put("/profile-media-archives/:id", SiteManagementController.addProfileMediaArchives);

/**
 * Delete site Management all module
 */
router.delete("/cover-image/:imageId/:id", SiteManagementController.deleteCoverPhoto);
router.delete("/profile-performance/:imageId/:id", SiteManagementController.deleteProfilePerformance);
router.delete("/profile-media-archives/:imageId/:id", SiteManagementController.deleteProfileMediaArchives);


export default router;
