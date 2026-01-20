"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutService = void 0;
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const about_schema_1 = require("./about.schema");
/* ------------------------------------------------
   CREATE ABOUT
------------------------------------------------ */
const createAbout = async (payload, file) => {
    const { title, description, points, year } = payload;
    const haveAbout = await about_schema_1.About.find({});
    if (haveAbout.length > 1) {
        throw new error_1.AppError(400, "Aready have a about");
    }
    let result;
    if (title && description) {
        result = await about_schema_1.About.findOneAndUpdate({}, {
            title,
            description,
        }, {
            new: true,
            upsert: true,
        });
    }
    if (points) {
        const pointText = points.trim();
        const existingPoint = await about_schema_1.About.findOne({
            "points.point": pointText,
        });
        if (existingPoint) {
            throw new error_1.AppError(409, "This point already exists");
        }
        result = await about_schema_1.About.findOneAndUpdate({}, {
            $push: {
                points: { point: pointText },
            },
        }, { new: true });
        if (!result) {
            throw new error_1.AppError(400, "Create title and description first");
        }
    }
    if (year && file) {
        const uploadImage = (await fileUpload_1.fileUploader.CloudinaryUpload(file));
        if (!uploadImage) {
            throw new error_1.AppError(500, "Failed to upload file");
        }
        result = await about_schema_1.About.findOneAndUpdate({}, {
            $addToSet: {
                images: {
                    year,
                    image: uploadImage.secure_url,
                },
            },
        }, { new: true, upsert: true });
    }
    return result;
};
/* ------------------------------------------------
   GET ABOUTS
------------------------------------------------ */
const getAbouts = async () => {
    const abouts = await about_schema_1.About.find({});
    if (!abouts.length) {
        throw new error_1.AppError(404, "About not found");
    }
    return abouts;
};
/* ------------------------------------------------
   DELETE ABOUT
------------------------------------------------ */
const deleteAbout = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "No payload provided");
    }
    let result;
    // ✅ DELETE IMAGE
    if (payload._id) {
        result = await about_schema_1.About.findOneAndUpdate({}, {
            $pull: {
                images: { _id: payload._id },
            },
        }, { new: true });
    }
    // ✅ DELETE POINT
    if (payload.point) {
        result = await about_schema_1.About.findOneAndUpdate({}, {
            $pull: {
                points: { point: payload.point },
            },
        }, { new: true });
    }
    return result;
};
/* ------------------------------------------------
   PATCH ABOUT
------------------------------------------------ */
const updateAboutPatch = async (id, payload, files) => {
    const about = await about_schema_1.About.findById(id);
    if (!about) {
        throw new error_1.AppError(404, "About not found");
    }
    /* ---------- EXISTING IMAGES ---------- */
    let existingImages = [];
    if (payload.existingImages) {
        existingImages = Array.isArray(payload.existingImages)
            ? payload.existingImages
            : [payload.existingImages];
    }
    /* ---------- UPLOAD NEW IMAGES ---------- */
    const uploadArray = async (fileArr) => {
        if (!fileArr || fileArr.length === 0)
            return [];
        const uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(fileArr);
        return uploaded.map((u) => u.secure_url);
    };
    const uploadedImages = await uploadArray(files?.images);
    const finalImages = [...existingImages, ...uploadedImages];
    // const updatePayload: any = {
    //   title: payload.title,
    //   name: payload.name,
    //   description: payload.description,
    //   details: payload.details,
    //   eventDate: payload.eventDate
    //     ? new Date(payload.eventDate)
    //     : about.eventDate,
    //   images: finalImages,
    // };
    // return await About.findByIdAndUpdate(id, updatePayload, { new: true });
};
/* ------------------------------------------------
   PUT ABOUT
------------------------------------------------ */
const updateAbout = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "No point provided");
    }
    return;
};
/* ------------------------------------------------
   EXPORT
------------------------------------------------ */
exports.AboutService = {
    createAbout,
    getAbouts,
    deleteAbout,
    updateAboutPatch,
    updateAbout,
};
