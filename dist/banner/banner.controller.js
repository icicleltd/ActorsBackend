"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const banner_services_1 = require("./banner.services");
/* ------------------------------------
   CREATE BANNER (Admin)
   image + title + subtitle
------------------------------------- */
const createBanner = (0, catchAsync_1.default)(async (req, res, next) => {
    const { title, description, imageUrl, order } = req.body;
    const result = await banner_services_1.BannerService.createBanner({
        imageUrl,
        title,
        description,
        order
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Banner created successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL BANNERS (Frontend/Admin)
------------------------------------- */
const getBanners = (0, catchAsync_1.default)(async (req, res, next) => {
    const sortBy = req.query?.sortBy || "order";
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const result = await banner_services_1.BannerService.getBanners(sortBy, sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banners fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE SINGLE BANNER (Admin)
------------------------------------- */
const deleteBanner = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await banner_services_1.BannerService.deleteBanner(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banner deleted successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE ALL BANNERS (Admin)
------------------------------------- */
const deleteAllBanners = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await banner_services_1.BannerService.deleteAllBanners();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All banners deleted successfully",
        data: result,
    });
});
/* ------------------------------------
   REORDER BANNERS (Admin)
------------------------------------- */
const reorderBanners = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await banner_services_1.BannerService.reorderBanners(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banner order updated successfully",
        data: result,
    });
});
exports.BannerController = {
    createBanner,
    getBanners,
    deleteBanner,
    deleteAllBanners,
    reorderBanners,
};
