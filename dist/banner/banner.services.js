"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerService = void 0;
const error_1 = require("../middleware/error");
const banner_schema_1 = require("./banner.schema");
/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createBanner = async (payload) => {
    const { imageUrl, title, description, order } = payload;
    if (!imageUrl || !title || !order) {
        throw new error_1.AppError(400, "Image title and order required");
    }
    console.log(payload);
    const result = await banner_schema_1.Banner.create({
        title,
        description,
        imageUrl,
        order,
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
const getBanners = async (sortBy = "order", sortWith = 1) => {
    const banners = await banner_schema_1.Banner.find().sort({ order: 1 });
    return banners;
};
/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteBanner = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Banner id is required");
    }
    const banner = await banner_schema_1.Banner.findById(id);
    if (!banner) {
        throw new error_1.AppError(404, "Banner not found");
    }
    // await deleteFromCloudinary(banner.publicId);
    await banner_schema_1.Banner.findByIdAndDelete(id);
    return banner;
};
/* ------------------------------------
   DELETE ALL BANNERS
------------------------------------- */
const deleteAllBanners = async () => {
    const banners = await banner_schema_1.Banner.find();
    for (const banner of banners) {
        // await deleteFromCloudinary(banner.publicId);
    }
    const result = await banner_schema_1.Banner.deleteMany({});
    return result;
};
/* ------------------------------------
   REORDER BANNERS
------------------------------------- */
const reorderBanners = async (items) => {
    if (!Array.isArray(items)) {
        throw new error_1.AppError(400, "Invalid reorder payload");
    }
    const bulkOps = items.map((item) => ({
        updateOne: {
            filter: { _id: item.id },
            update: { order: item.order },
        },
    }));
    await banner_schema_1.Banner.bulkWrite(bulkOps);
    return true;
};
exports.BannerService = {
    createBanner,
    getBanners,
    deleteBanner,
    deleteAllBanners,
    reorderBanners,
};
