"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const youtube_services_1 = require("./youtube.services");
/* ------------------------------------
   CREATE BANNER (Admin)
   image + title + subtitle
------------------------------------- */
const createYoutbe = (0, catchAsync_1.default)(async (req, res, next) => {
    const { title, url } = req.body;
    console.log(req.body);
    const result = await youtube_services_1.YoutubeService.createYoutbe({
        title,
        url,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Youtube created successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL BANNERS (Frontend/Admin)
------------------------------------- */
const getYoutube = (0, catchAsync_1.default)(async (req, res, next) => {
    const sortBy = req.query?.sortBy || "order";
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const result = await youtube_services_1.YoutubeService.getYoutube(sortBy, sortWith);
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
const deleteYoutube = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await youtube_services_1.YoutubeService.deleteYoutube(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banner deleted successfully",
        data: result,
    });
});
exports.YoutubeController = {
    createYoutbe,
    getYoutube,
    deleteYoutube,
};
