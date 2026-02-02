"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteManagementService = void 0;
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const senitizePayload_1 = require("../helper/senitizePayload");
const error_1 = require("../middleware/error");
/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const uploadCoverImages = async (payload) => {
    const { urls, idNo } = payload;
    console.log(payload);
    if (!urls) {
        throw new error_1.AppError(400, "Urls and idNo required");
    }
    const result = await actor_schema_1.default.findOneAndUpdate({
        idNo: idNo,
    }, {
        $addToSet: {
            coverImages: { url: urls },
        },
    });
    if (!result) {
        throw new error_1.AppError(404, "Banner not created");
    }
    return urls;
};
/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getBanners = async (sortBy = "order", sortWith = 1) => {
    const banners = await actor_schema_1.default.find().sort({ [sortBy]: sortWith });
    return banners;
};
const updateProfileAbout = async (profileData, idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "ID No is required");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(profileData);
    const updateSanitize = {
        ...sanitize,
        height: {
            feet: Number(sanitize.heightFeet),
            inches: Number(sanitize.heightInch),
        },
    };
    try {
        const result = await actor_schema_1.default.findOneAndUpdate({ idNo }, { $set: updateSanitize }, { new: true, runValidators: true });
        if (!result) {
            throw new error_1.AppError(404, "Profile not updated");
        }
        return result;
    }
    catch (error) {
        console.log(error);
    }
};
const addProfilePerformance = async (payloadPerformance, idNo) => {
    console.log("performance", payloadPerformance);
    if (!idNo) {
        throw new error_1.AppError(400, "ID No is required");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(payloadPerformance);
    console.log(sanitize);
    const updateSanitize = {
        ...sanitize,
    };
    const result = await actor_schema_1.default.findOneAndUpdate({ idNo }, { $addToSet: { performanceInfo: updateSanitize } }, { new: true, runValidators: true });
    console.log("result", result);
    if (!result) {
        throw new error_1.AppError(404, "Profile not updated");
    }
    return result;
};
/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteCoverPhoto = async (imageId, id) => {
    console.log(imageId, id);
    if (!imageId || !id) {
        throw new error_1.AppError(400, "Cover imageId and id are required");
    }
    const banner = await actor_schema_1.default.findOneAndUpdate({
        idNo: id,
    }, {
        $pull: {
            coverImages: { _id: imageId },
        },
    });
    if (!banner) {
        throw new error_1.AppError(404, "Banner not found");
    }
    // await deleteFromCloudinary(banner.publicId);
    return banner;
};
exports.SiteManagementService = {
    uploadCoverImages,
    getBanners,
    deleteCoverPhoto,
    updateProfileAbout,
    addProfilePerformance,
};
