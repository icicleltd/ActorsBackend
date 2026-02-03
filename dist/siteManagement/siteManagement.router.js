"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const siteManagement_controller_1 = require("./siteManagement.controller");
const router = express_1.default.Router();
/**
 * Create site Management all module
 */
router.post("/upload-cover-images", siteManagement_controller_1.SiteManagementController.uploadCoverImages);
/**
 * Get site Management all module
 */
router.get("/", siteManagement_controller_1.SiteManagementController.getBanners);
/**
 * update site Management all module
 */
router.put("/profile-about/:id", siteManagement_controller_1.SiteManagementController.updateProfileAbout);
router.put("/profile-performance/:id", siteManagement_controller_1.SiteManagementController.addProfilePerformance);
router.put("/profile-media-archives/:id", siteManagement_controller_1.SiteManagementController.addProfileMediaArchives);
router.put("/profile-news/:id", siteManagement_controller_1.SiteManagementController.addProfileNews);
router.put("/profile-edit-news/:id", siteManagement_controller_1.SiteManagementController.editProfileNews);
/**
 * Delete site Management all module
 */
router.delete("/cover-image/:imageId/:id", siteManagement_controller_1.SiteManagementController.deleteCoverPhoto);
router.delete("/profile-performance/:imageId/:id", siteManagement_controller_1.SiteManagementController.deleteProfilePerformance);
router.delete("/profile-media-archives/:imageId/:id", siteManagement_controller_1.SiteManagementController.deleteProfileMediaArchives);
router.delete("/profile-news/:newsId/:id", siteManagement_controller_1.SiteManagementController.deleteProfileNews);
exports.default = router;
