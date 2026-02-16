"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsController = void 0;
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const news_services_1 = require("./news.services");
const createNews = (0, catchAsync_1.default)(async (req, res) => {
    const payload = req.body;
    // const file = req.file;
    const result = await news_services_1.NewsService.createNews(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "News created successfully",
        data: result,
    });
});
const getAllNews = (0, catchAsync_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sortBy = req.query.sortBy || "createdAt";
    const skip = (page - 1) * limit;
    const sortWith = req.query.sortWith === "asc" ? 1 : -1;
    const result = await news_services_1.NewsService.getAllNews(limit, page, sortBy, sortWith, skip);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News fetched successfully",
        data: result,
    });
});
const getSingleNews = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await news_services_1.NewsService.getSingleNews(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News fetched successfully",
        data: result,
    });
});
const deleteNews = (0, catchAsync_1.default)(async (req, res) => {
    const result = await news_services_1.NewsService.deleteNews(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News deleted successfully",
        data: result,
    });
});
const editNews = (0, catchAsync_1.default)(async (req, res) => {
    // const file = req.file;
    const payload = req.body;
    const id = req.params.id;
    const result = await news_services_1.NewsService.editNews(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "News deleted successfully",
        data: result,
    });
});
exports.NewsController = {
    createNews,
    getAllNews,
    getSingleNews,
    deleteNews,
    editNews,
};
