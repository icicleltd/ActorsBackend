"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteManagementController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const siteManagement_services_1 = require("./siteManagement.services");
const uploadCoverImages = (0, catchAsync_1.default)(async (req, res, next) => {
    const { urls, idNo } = req.body;
    const result = await siteManagement_services_1.SiteManagementService.uploadCoverImages({
        urls,
        idNo,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Banner created successfully",
        data: result,
    });
});
const createBreakingNews = (0, catchAsync_1.default)(async (req, res, next) => {
    const { title } = req.body;
    const result = await siteManagement_services_1.SiteManagementService.createBreakingNews({
        title,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "BreakingNews created successfully",
        data: result,
    });
});
const getBreakingNews = (0, catchAsync_1.default)(async (req, res, next) => {
    const sortBy = req.query?.sortBy || "createdAt";
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const result = await siteManagement_services_1.SiteManagementService.getBreakingNews(sortBy, sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "BreakingNews fetched successfully",
        data: result,
    });
});
const getBanners = (0, catchAsync_1.default)(async (req, res, next) => {
    const sortBy = req.query?.sortBy || "order";
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const result = await siteManagement_services_1.SiteManagementService.getBanners(sortBy, sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banners fetched successfully",
        data: result,
    });
});
const getPortfolio = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    // const sortBy = (req.query?.sortBy as string) || "order";
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 12;
    // const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;
    const tabId = req.query?.tabId;
    const result = await siteManagement_services_1.SiteManagementService.getPortfolio(idNo, page, limit, tabId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Portfolio fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE SINGLE BANNER (Admin)
------------------------------------- */
const deleteCoverPhoto = (0, catchAsync_1.default)(async (req, res, next) => {
    const { imageId, id } = req.params;
    const result = await siteManagement_services_1.SiteManagementService.deleteCoverPhoto(imageId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Cover photo deleted successfully",
        data: result,
    });
});
const deleteBreakingNews = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await siteManagement_services_1.SiteManagementService.deleteBreakingNews(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "BreakingNews deleted successfully",
        data: result,
    });
});
const deleteProfilePerformance = (0, catchAsync_1.default)(async (req, res, next) => {
    const { imageId, id } = req.params;
    const result = await siteManagement_services_1.SiteManagementService.deleteProfilePerformance(imageId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Profile performance deleted successfully",
        data: result,
    });
});
const deleteProfileMediaArchives = (0, catchAsync_1.default)(async (req, res, next) => {
    const { imageId, id } = req.params;
    const result = await siteManagement_services_1.SiteManagementService.deleteProfileMediaArchives(imageId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Profile media archives deleted successfully",
        data: result,
    });
});
const deleteProfileNews = (0, catchAsync_1.default)(async (req, res, next) => {
    const { newsId, id } = req.params;
    const result = await siteManagement_services_1.SiteManagementService.deleteProfileNews(newsId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Profile news deleted successfully",
        data: result,
    });
});
const deleteTab = (0, catchAsync_1.default)(async (req, res, next) => {
    const { tabId, id } = req.params;
    const result = await siteManagement_services_1.SiteManagementService.deleteTab(tabId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Portfolio news deleted successfully",
        data: result,
    });
});
const deleteWork = (0, catchAsync_1.default)(async (req, res, next) => {
    const { tabId, workId, id } = req.params;
    const result = await siteManagement_services_1.SiteManagementService.deleteWork(tabId, workId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Profile news deleted successfully",
        data: result,
    });
});
const updateProfileAbout = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    const { profileData } = req.body;
    const result = await siteManagement_services_1.SiteManagementService.updateProfileAbout(profileData, idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});
const addProfilePerformance = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    const result = await siteManagement_services_1.SiteManagementService.addProfilePerformance(req.body, idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Performance added successfully",
        data: result,
    });
});
const addProfileMediaArchives = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    const result = await siteManagement_services_1.SiteManagementService.addProfileMediaArchives(req.body, idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Media archives added successfully",
        data: result,
    });
});
const addProfileNews = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await siteManagement_services_1.SiteManagementService.addProfileNews(payload, idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News added successfully",
        data: result,
    });
});
const editProfileNews = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await siteManagement_services_1.SiteManagementService.editProfileNews(payload, idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News edited successfully",
        data: result,
    });
});
const createTabs = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await siteManagement_services_1.SiteManagementService.createTabs(payload, idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News edited successfully",
        data: result,
    });
});
const uploadWork = (0, catchAsync_1.default)(async (req, res, next) => {
    const idNo = req.params.id;
    const payload = req.body;
    const result = await siteManagement_services_1.SiteManagementService.uploadWorks(payload, idNo);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News edited successfully",
        data: result,
    });
});
exports.SiteManagementController = {
    uploadCoverImages,
    getBanners,
    deleteCoverPhoto,
    updateProfileAbout,
    addProfilePerformance,
    deleteProfilePerformance,
    addProfileMediaArchives,
    deleteProfileMediaArchives,
    addProfileNews,
    deleteProfileNews,
    editProfileNews,
    createTabs,
    uploadWork,
    getBreakingNews,
    getPortfolio,
    deleteWork,
    deleteTab,
    createBreakingNews,
    deleteBreakingNews,
};
