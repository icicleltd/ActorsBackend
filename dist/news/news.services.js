"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const error_1 = require("../middleware/error");
const news_schema_1 = require("./news.schema");
const senitizePayload_1 = require("../helper/senitizePayload");
const mongoose_1 = require("mongoose");
const createNews = async (payload) => {
    // if (!file) {
    //   throw new AppError(400, "Image is required");
    // }
    // const upload = (await fileUploader.CloudinaryUpload(file)) as {
    //   secure_url: string;
    // };
    const { title, image, published, link, details, category } = payload;
    if (!title || !image || !published || !link || !details || !category) {
        throw new error_1.AppError(400, "title,image,published,link,details,category required");
    }
    const news = await news_schema_1.News.create({
        title: payload.title,
        image: payload.image,
        published: payload.published,
        link: payload.link,
        details: payload.details,
        category: payload.category,
    });
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
    if (!news)
        throw new error_1.AppError(404, "News not found");
    return news;
};
const editNews = async (id, payload) => {
    // let uploadUrl;
    // if (!Types.ObjectId.isValid(id)) {
    //   throw new AppError(400, "This is not vaild");
    // }
    // if (file) {
    //   uploadUrl = (await fileUploader.CloudinaryUpload(file)) as {
    //     secure_url: string;
    //   };
    // }
    const cleanedPayload = (0, senitizePayload_1.sanitizePayload)(payload);
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
