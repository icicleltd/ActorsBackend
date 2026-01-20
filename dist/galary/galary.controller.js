"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const galary_services_1 = require("./galary.services");
/* ------------------------------------
   UPLOAD GALLERY IMAGES (Admin)
------------------------------------- */
const createGalleryImages = (0, catchAsync_1.default)(async (req, res, next) => {
    const files = req.files;
    const result = await galary_services_1.GalleryService.createGalleryImages(files);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Gallery images uploaded successfully",
        data: result,
    });
});
/* ------------------------------------
   GET GALLERY IMAGES (Frontend/Admin)
------------------------------------- */
const getGalleryImages = (0, catchAsync_1.default)(async (req, res, next) => {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query?.sortBy || "createdAt";
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const result = await galary_services_1.GalleryService.getGalleryImages(skip, limit, sortBy, sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Gallery images fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE SINGLE GALLERY IMAGE (Admin)
------------------------------------- */
const deleteGalleryImage = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await galary_services_1.GalleryService.deleteGalleryImage(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Gallery image deleted successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE ALL GALLERY IMAGES (Admin)
------------------------------------- */
const deleteAllGalleryImages = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await galary_services_1.GalleryService.deleteAllGalleryImages();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All gallery images deleted successfully",
        data: result,
    });
});
exports.GalleryController = {
    createGalleryImages,
    getGalleryImages,
    deleteGalleryImage,
    deleteAllGalleryImages,
};
