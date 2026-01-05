"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryService = void 0;
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const galary_schema_1 = require("./galary.schema");
/* ------------------------------------
   UPLOAD IMAGES
------------------------------------- */
const createGalleryImages = async (files) => {
    if (!files || !files.images || files.images.length === 0) {
        throw new error_1.AppError(400, "Images are required");
    }
    const uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(files.images);
    const images = uploaded.map((u) => ({
        publicId: u.public_id,
        image: u.secure_url,
    }));
    const result = await galary_schema_1.Gallery.create(images);
    return result;
};
/* ------------------------------------
   GET ALL IMAGES (Frontend/Admin)
------------------------------------- */
const getGalleryImages = async (skip, limit, sortBy, sortWith) => {
    const images = await galary_schema_1.Gallery.find()
        .sort({ [sortBy]: sortWith })
        .skip(skip)
        .limit(limit);
    // if (!images.length) {
    //   throw new AppError(404, "No gallery images found");
    // }
    return images;
};
/* ------------------------------------
   DELETE SINGLE IMAGE
------------------------------------- */
const deleteGalleryImage = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Gallery image id is required");
    }
    const image = await galary_schema_1.Gallery.findById(id);
    if (!image) {
        throw new error_1.AppError(404, "Gallery image not found");
    }
    await (0, fileUpload_1.deleteFromCloudinary)(image.publicId);
    await galary_schema_1.Gallery.findByIdAndDelete(id);
    return image;
};
/* ------------------------------------
   DELETE ALL IMAGES
------------------------------------- */
const deleteAllGalleryImages = async () => {
    const result = await galary_schema_1.Gallery.deleteMany({});
    return result;
};
exports.GalleryService = {
    createGalleryImages,
    getGalleryImages,
    deleteGalleryImage,
    deleteAllGalleryImages,
};
