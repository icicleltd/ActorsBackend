"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutService = void 0;
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const about_schema_1 = require("./about.schema");
/* ------------------------------------------------
   CREATE ABOUT
------------------------------------------------ */
const createAbout = async (payload, files) => {
    const { title, name, description, eventDate, isBookingOpen } = payload;
    if (!files) {
        throw new error_1.AppError(400, "File required");
    }
    const uploadArray = async (fileArr) => {
        if (!fileArr || fileArr.length === 0)
            return [];
        const uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(fileArr);
        return uploaded.map((u) => u.secure_url);
    };
    const [logo, banner, images] = await Promise.all([
        uploadArray(files.logo).then(r => r[0] || null),
        uploadArray(files.banner).then(r => r[0] || null),
        uploadArray(files.images),
    ]);
    if (!eventDate || !name) {
        throw new error_1.AppError(400, "Name and date are required");
    }
    const eventTime = new Date(eventDate);
    const isUpcoming = eventTime > new Date();
    /* ---------- UPCOMING ABOUT ---------- */
    if (isUpcoming) {
        if (!logo || !banner) {
            throw new error_1.AppError(400, "Logo and banner are required");
        }
        // return await About.create({
        //   title,
        //   description,
        //   isBookingOpen: isBookingOpen ?? true,
        //   registrationCount: 0,
        // });
    }
    /* ---------- PAST ABOUT ---------- */
    if (!images.length) {
        throw new error_1.AppError(400, "Images are required");
    }
    // return await About.create({
    //   name,
    //   title,
    //   eventDate: eventTime,
    //   description,
    //   images,
    // });
};
/* ------------------------------------------------
   GET ABOUTS
------------------------------------------------ */
const getAbouts = async ({ eventType }, sortBy = "createdAt", sortWith = -1) => {
    const now = new Date();
    const filter = {};
    if (eventType === "PAST") {
        filter.eventDate = { $lt: now };
    }
    if (eventType === "UPCOMING") {
        filter.eventDate = { $gte: now };
    }
    const abouts = await about_schema_1.About.find(filter).sort({ [sortBy]: sortWith });
    if (!abouts.length) {
        throw new error_1.AppError(404, "About not found");
    }
    return abouts;
};
/* ------------------------------------------------
   DELETE ABOUT
------------------------------------------------ */
const deleteAbout = async (aboutId) => {
    if (!aboutId) {
        throw new error_1.AppError(400, "No about id provided");
    }
    const about = await about_schema_1.About.findByIdAndDelete(aboutId);
    if (!about) {
        throw new error_1.AppError(404, "About not found");
    }
    return about;
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
const updateAbout = async (id, payload, files) => {
    const about = await about_schema_1.About.findById(id);
    if (!about) {
        throw new error_1.AppError(404, "About not found");
    }
    const { title, name, description, eventDate } = payload;
    if (!title || !name || !description || !eventDate) {
        throw new error_1.AppError(400, "Required fields missing for PUT update");
    }
    const eventTime = new Date(eventDate);
    if (eventTime > new Date()) {
        throw new error_1.AppError(400, "You selected a future date. Please select a past date.");
    }
    let existingImages = [];
    if (payload.existingImages) {
        existingImages = Array.isArray(payload.existingImages)
            ? payload.existingImages
            : [payload.existingImages];
    }
    const uploadArray = async (fileArr) => {
        if (!fileArr || fileArr.length === 0)
            return [];
        const uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(fileArr);
        return uploaded.map((u) => u.secure_url);
    };
    const uploadedImages = await uploadArray(files?.images);
    const finalImages = [...existingImages, ...uploadedImages];
    if (!finalImages.length) {
        throw new error_1.AppError(400, "At least one image is required");
    }
    return await about_schema_1.About.findByIdAndUpdate(id, {
        title,
        name,
        description,
        details: payload.details || "",
        eventDate: eventTime,
        images: finalImages,
    }, { new: true });
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
