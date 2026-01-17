"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponcerController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const sponcer_services_1 = require("./sponcer.services");
/* ------------------------------------
   CREATE BANNER (Admin)
   image + title + subtitle
------------------------------------- */
const createSponcer = (0, catchAsync_1.default)(async (req, res, next) => {
    const { title, url } = req.body;
    console.log(req.body);
    const result = await sponcer_services_1.SponcerService.createSponcer({
        title,
        url,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Sponcer created successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL BANNERS (Frontend/Admin)
------------------------------------- */
const getSponcer = (0, catchAsync_1.default)(async (req, res, next) => {
    const sortBy = req.query?.sortBy || "order";
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const result = await sponcer_services_1.SponcerService.getSponcer(sortBy, sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Sponcer fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE SINGLE BANNER (Admin)
------------------------------------- */
const deleteSponcer = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await sponcer_services_1.SponcerService.deleteSponcer(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Sponcer deleted successfully",
        data: result,
    });
});
exports.SponcerController = {
    createSponcer,
    getSponcer,
    deleteSponcer,
};
