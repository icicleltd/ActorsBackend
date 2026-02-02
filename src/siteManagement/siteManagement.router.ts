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

/**
 * Delete site Management all module
 */
router.delete("/cover-image/:imageId/:id", SiteManagementController.deleteCoverPhoto);


export default router;
