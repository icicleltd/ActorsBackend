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
/**
 * Delete site Management all module
 */
router.delete("/cover-image/:imageId/:id", siteManagement_controller_1.SiteManagementController.deleteCoverPhoto);
exports.default = router;
