"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const error_1 = require("../middleware/error");
const fileUpload_1 = require("../helper/fileUpload");
const news_schema_1 = require("./news.schema");
const senitizePayload_1 = require("../helper/senitizePayload");
const mongoose_1 = require("mongoose");
const createNews = async (payload, file) => {
    if (!file) {
        throw new error_1.AppError(400, "Image is required");
    }
    const upload = (await fileUpload_1.fileUploader.CloudinaryUpload(file));
    console.log(payload);
    const news = await news_schema_1.News.create({
        title: payload.title,
        image: upload.secure_url,
        published: payload.published,
        link: payload.link,
        details: payload.details,
        category: payload.category,
    });
    console.log(news);
    return news;
};
const getAllNews = async (limit, page, sortBy, sortWith, skip) => {
    // const news = await News.find()
    //   .sort({ [sortBy]: sortWith })
    //   .skip(skip)
    //   .limit(limit);
    // const total = await News.countDocuments();
    const [news, total] = await Promise.all([
        news_schema_1.News.find()
            .sort({ [sortBy]: sortWith })
            .skip(skip)
            .limit(limit),
        news_schema_1.News.countDocuments(),
    ]);
    const totalPages = Math.ceil(total / limit);
    console.log(total);
    return { news, total, totalPages };
};
const getSingleNews = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "This is not vaild");
    }
    const news = await news_schema_1.News.findById(id);
    if (!news)
        throw new error_1.AppError(404, "News not found");
    return news;
};
const deleteNews = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "This is not vaild");
    }
    const news = await news_schema_1.News.findByIdAndDelete(id);
    console.log(news);
    if (!news)
        throw new error_1.AppError(404, "News not found");
    return news;
};
const editNews = async (id, payload, file) => {
    let uploadUrl;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "This is not vaild");
    }
    if (file) {
        uploadUrl = (await fileUpload_1.fileUploader.CloudinaryUpload(file));
    }
    const updatedPayload = {
        ...payload,
        ...(uploadUrl && { image: uploadUrl.secure_url }),
    };
    const cleanedPayload = (0, senitizePayload_1.sanitizePayload)(updatedPayload);
    console.log(cleanedPayload);
    const updateNews = await news_schema_1.News.findByIdAndUpdate(id, {
        $set: cleanedPayload,
    }, { new: true, runValidators: true });
    return updateNews;
};
exports.NewsService = {
    createNews,
    getAllNews,
    getSingleNews,
    deleteNews,
    editNews,
};
