"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const about_services_1 = require("./about.services");
/* ------------------------------------
   CREATE ABOUT
------------------------------------ */
const createAbout = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const file = req.file;
    const result = await about_services_1.AboutService.createAbout(payload, file);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "About created successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ABOUTS
------------------------------------ */
const getAbouts = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await about_services_1.AboutService.getAbouts();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Abouts fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
const deleteAbout = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const result = await about_services_1.AboutService.deleteAbout(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "About deleted successfully",
        data: result,
    });
});
/* ------------------------------------
   UPDATE ABOUT
------------------------------------ */
const updateAbout = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const result = await about_services_1.AboutService.updateAbout(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "About updated successfully",
        data: result,
    });
});
/* ------------------------------------
   EXPORT
------------------------------------ */
exports.AboutController = {
    createAbout,
    getAbouts,
    deleteAbout,
    updateAbout,
};
