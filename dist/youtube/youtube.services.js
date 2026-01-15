"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeService = void 0;
const error_1 = require("../middleware/error");
const youtube_schema_1 = require("./youtube.schema");
/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createYoutbe = async (payload) => {
    const { title, url } = payload;
    if (!url) {
        throw new error_1.AppError(400, "Url required");
    }
    console.log(payload);
    const result = await youtube_schema_1.Youtube.create({
        title,
        url,
    });
    console.log(result);
    if (!result) {
        throw new error_1.AppError(404, "Banner not created");
    }
    return result;
};
/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getYoutube = async (sortBy = "order", sortWith = 1) => {
    const banners = await youtube_schema_1.Youtube.find().sort({ order: 1 });
    return banners;
};
/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteYoutube = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Banner id is required");
    }
    const banner = await youtube_schema_1.Youtube.findById(id);
    if (!banner) {
        throw new error_1.AppError(404, "Banner not found");
    }
    // await deleteFromCloudinary(banner.publicId);
    await youtube_schema_1.Youtube.findByIdAndDelete(id);
    return banner;
};
exports.YoutubeService = {
    createYoutbe,
    getYoutube,
    deleteYoutube,
};
