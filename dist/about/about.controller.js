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
    const files = req.files;
    const result = await about_services_1.AboutService.createAbout(payload, files);
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
    const eventType = req.query.eventType;
    const sortBy = req.query.sortBy;
    const sortWith = req.query.sortWith === "asc"
        ? 1
        : req.query.sortWith === "desc"
            ? -1
            : -1;
    const payload = {};
    if (eventType === "PAST" || eventType === "UPCOMING") {
        payload.eventType = eventType;
    }
    const result = await about_services_1.AboutService.getAbouts(payload, sortBy, sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Abouts fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ADMIN ABOUTS
------------------------------------ */
const getAdminAbouts = (0, catchAsync_1.default)(async (req, res, next) => {
    const adminId = req.params.id;
    const result = await about_services_1.AboutService.getAbouts(adminId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admin abouts fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   READ ABOUT
------------------------------------ */
const readAbout = (0, catchAsync_1.default)(async (req, res, next) => {
    const aboutId = req.params.id;
    const result = await about_services_1.AboutService.getAbouts(aboutId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "About updated successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
const deleteAbout = (0, catchAsync_1.default)(async (req, res, next) => {
    const aboutId = req.params.id;
    const result = await about_services_1.AboutService.deleteAbout(aboutId);
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
    const { id } = req.params;
    const payload = req.body;
    const files = req.files;
    const result = await about_services_1.AboutService.updateAbout(id, payload, files);
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
    getAdminAbouts,
    readAbout,
    deleteAbout,
    updateAbout,
};
