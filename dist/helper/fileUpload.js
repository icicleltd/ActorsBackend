"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = exports.deleteFromCloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
// Multer memory storage (required for Vercel)
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Cloudinary config
cloudinary_1.v2.config({
    cloud_name: "dk4ltobvb",
    api_key: "548264937859395",
    api_secret: "6_MiNGp0BDmahMzIP0V-WDeygVE",
});
// Upload single file (buffer)
const CloudinaryUpload = async (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ public_id: file.originalname }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
        stream.end(file.buffer); // send raw buffer
    });
};
// Upload multiple
const CloudinaryUploadMultiple = async (files) => {
    const uploaded = [];
    for (const file of files) {
        const result = await CloudinaryUpload(file);
        uploaded.push(result);
    }
    return uploaded;
};
// Upload single PDF
const CloudinaryUploadPDF = async (file) => {
    if (file.mimetype !== "application/pdf") {
        throw new Error("Only PDF files are allowed");
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: "raw",
            folder: "pdfs",
            public_id: file.originalname.replace(".pdf", ""),
            format: "pdf", // 🔥 REQUIRED
            use_filename: true,
            unique_filename: false,
        }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
        stream.end(file.buffer);
    });
};
const CloudinaryUploadMultiplePDF = async (files) => {
    const uploaded = [];
    for (const file of files) {
        const result = await CloudinaryUploadPDF(file);
        uploaded.push(result);
    }
    return uploaded;
};
const deleteFromCloudinary = async (publicId) => {
    return cloudinary_1.v2.uploader.destroy(publicId);
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.fileUploader = {
    upload,
    CloudinaryUpload,
    CloudinaryUploadMultiple,
    CloudinaryUploadPDF,
    CloudinaryUploadMultiplePDF,
};
