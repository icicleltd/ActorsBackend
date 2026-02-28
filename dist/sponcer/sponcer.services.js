"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsorService = void 0;
const senitizePayload_1 = require("../helper/senitizePayload");
const error_1 = require("../middleware/error");
const requiredName_1 = require("../notification/hepler/requiredName");
const sponcer_schema_1 = require("./sponcer.schema");
/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createSponcer = async (payload) => {
    const { name, url, description, discount, validity, terms } = payload;
    (0, requiredName_1.requiredString)(name, "Name");
    (0, requiredName_1.requiredString)(url, "URL");
    (0, requiredName_1.requiredString)(description, "Description");
    (0, requiredName_1.requiredString)(discount, "Discount");
    (0, requiredName_1.requiredString)(terms, "Terms & Conditions");
    if (!validity || isNaN(Date.parse(validity))) {
        throw new error_1.AppError(400, "Valid validity date is required");
    }
    const result = await sponcer_schema_1.Sponcer.create(payload);
    if (!result) {
        throw new error_1.AppError(404, "Banner not created");
    }
    return result;
};
const editSponsor = async (id, payload) => {
    if (!id) {
        throw new error_1.AppError(400, "Sponsor not found");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(payload);
    if (!Object.keys(sanitize).length) {
        throw new error_1.AppError(400, "No valid fields to update");
    }
    const result = await sponcer_schema_1.Sponcer.findByIdAndUpdate(id, {
        $set: sanitize,
    }, { new: true, runValidators: true });
    console.log(result);
    if (!result) {
        throw new error_1.AppError(404, "Sponsor not Updated");
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
exports.SponsorService = {
    createSponcer,
    getSponcer,
    deleteSponcer,
    editSponsor,
};
