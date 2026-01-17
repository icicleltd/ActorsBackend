"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponcerService = void 0;
const error_1 = require("../middleware/error");
const sponcer_schema_1 = require("./sponcer.schema");
/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createSponcer = async (payload) => {
    const { title, url } = payload;
    if (!url) {
        throw new error_1.AppError(400, "Url required");
    }
    console.log(payload);
    const result = await sponcer_schema_1.Sponcer.create({
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
const getSponcer = async (sortBy = "order", sortWith = 1) => {
    const banners = await sponcer_schema_1.Sponcer.find().sort({ order: 1 });
    return banners;
};
/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteSponcer = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Banner id is required");
    }
    const banner = await sponcer_schema_1.Sponcer.findById(id);
    if (!banner) {
        throw new error_1.AppError(404, "Banner not found");
    }
    // await deleteFromCloudinary(banner.publicId);
    await sponcer_schema_1.Sponcer.findByIdAndDelete(id);
    return banner;
};
exports.SponcerService = {
    createSponcer,
    getSponcer,
    deleteSponcer,
};
