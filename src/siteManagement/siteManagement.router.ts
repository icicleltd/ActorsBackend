import express from "express";
import { SiteManagementController } from "./siteManagement.controller";

const router = express.Router();

/**
 * Create site Management all module
 */
router.post("/upload-cover-images", SiteManagementController.uploadCoverImages);
router.post("/breaking-news", SiteManagementController.createBreakingNews);
router.post("/create-tab/:id", SiteManagementController.createTabs);
router.post("/upload-work/:id", SiteManagementController.uploadWork);

/**
 * Get site Management all module
 */
router.get("/portfolio/:id", SiteManagementController.getPortfolio);
router.get("/breaking-news", SiteManagementController.getBreakingNews);
router.get("/", SiteManagementController.getBanners);

/**
 * update site Management all module
 */
router.put("/profile-about/:id", SiteManagementController.updateProfileAbout);
router.put(
  "/profile-performance/:id",
  SiteManagementController.addProfilePerformance,
);
router.put(
  "/profile-media-archives/:id",
  SiteManagementController.addProfileMediaArchives,
);
router.put("/profile-news/:id", SiteManagementController.addProfileNews);
router.put("/profile-edit-news/:id", SiteManagementController.editProfileNews);

/**
 * Delete site Management all module
 */
router.delete(
  "/breaking-news/:id",
  SiteManagementController.deleteBreakingNews,
);
router.delete(
  "/portfolio-work/:tabId/:workId/:id",
  SiteManagementController.deleteWork,
);
router.delete(
  "/portfolio-tab/:tabId/:id",
  SiteManagementController.deleteTab,
);
router.delete(
  "/cover-image/:imageId/:id",
  SiteManagementController.deleteCoverPhoto,
);
router.delete(
  "/profile-performance/:imageId/:id",
  SiteManagementController.deleteProfilePerformance,
);
router.delete(
  "/profile-media-archives/:imageId/:id",
  SiteManagementController.deleteProfileMediaArchives,
);
router.delete(
  "/profile-news/:newsId/:id",
  SiteManagementController.deleteProfileNews,
);

export default router;
