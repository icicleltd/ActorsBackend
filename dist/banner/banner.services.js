"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerService = void 0;
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const banner_schema_1 = require("./banner.schema");
/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createBanner = async (payload) => {
    const { file, title, description } = payload;
    console.log("title, desc", payload);
    let result;
    if (title && description) {
        result = await banner_schema_1.Banner.findOneAndUpdate({}, {
            title,
            description,
        }, {
            new: true,
            upsert: true,
        });
    }
    // Upload to Cloudinary
    // const uploadResult = await fileUploader.CloudinaryUpload(file);
    // // Get last order
    // const lastBanner = await Banner.findOne().sort({ order: -1 });
    // const order = lastBanner ? lastBanner.order + 1 : 1;
    // const banner = await Banner.create({
    //   title,
    //   subtitle,
    //   imageUrl: uploadResult.secure_url,
    //   publicId: uploadResult.public_id,
    //   order,
    // });
    return result;
};
/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getBanners = async (sortBy = "order", sortWith = 1) => {
    const banners = await banner_schema_1.Banner.find().sort({ [sortBy]: sortWith });
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
    await (0, fileUpload_1.deleteFromCloudinary)(banner.publicId);
    await banner_schema_1.Banner.findByIdAndDelete(id);
    return banner;
};
/* ------------------------------------
   DELETE ALL BANNERS
------------------------------------- */
const deleteAllBanners = async () => {
    const banners = await banner_schema_1.Banner.find();
    for (const banner of banners) {
        await (0, fileUpload_1.deleteFromCloudinary)(banner.publicId);
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
