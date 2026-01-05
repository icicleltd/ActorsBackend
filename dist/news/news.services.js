"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const error_1 = require("../middleware/error");
const fileUpload_1 = require("../helper/fileUpload");
const news_schema_1 = require("./news.schema");
const createNews = async (payload, file) => {
    if (!file) {
        throw new error_1.AppError(400, "Image is required");
    }
    const upload = (await fileUpload_1.fileUploader.CloudinaryUpload(file));
    const news = await news_schema_1.News.create({
        title: payload.title,
        image: upload.secure_url,
        published: payload.published,
        link: payload.link,
    });
    console.log(news);
    return news;
};
const getAllNews = async (limit, page, sortBy, sortWith, skip) => {
    return news_schema_1.News.find()
        .sort({ [sortBy]: sortWith })
        .skip(skip)
        .limit(limit);
};
const getSingleNews = async (id) => {
    const news = await news_schema_1.News.findById(id);
    if (!news)
        throw new error_1.AppError(404, "News not found");
    return news;
};
const deleteNews = async (id) => {
    const news = await news_schema_1.News.findByIdAndDelete(id);
    console.log(news);
    if (!news)
        throw new error_1.AppError(404, "News not found");
    return news;
};
exports.NewsService = {
    createNews,
    getAllNews,
    getSingleNews,
    deleteNews,
};
