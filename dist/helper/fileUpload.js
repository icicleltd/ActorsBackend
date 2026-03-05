"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = exports.deleteFromCloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const path_1 = __importDefault(require("path"));
// Multer memory storage (required for Vercel)
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Cloudinary config personal account
// cloudinary.config({
//   cloud_name: "dk4ltobvb",
//   api_key: "548264937859395",
//   api_secret: "6_MiNGp0BDmahMzIP0V-WDeygVE",
// });
// Cloudinary config office account
cloudinary_1.v2.config({
    cloud_name: "dgywkhtxz",
    api_key: "967534559333113",
    api_secret: "W0Lr6YQocCLQAZ1SYuazvR4e128",
});
const getPublicId = (filename, folder = "uploads") => {
    const name = path_1.default.parse(filename).name;
    return `${folder}/${Date.now()}-${name}`;
};
// ✅ Single image upload
const CloudinaryUpload = async (file) => {
    // console.log("file",file)
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ public_id: getPublicId(file.originalname) }, // ✅ no extension
        (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
        stream.end(file.buffer);
    });
};
// ✅ Single PDF upload
const CloudinaryUploadPDF = async (file) => {
    if (file.mimetype !== "application/pdf") {
        throw new Error("Only PDF files are allowed");
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: "raw",
            folder: "pdfs",
            public_id: getPublicId(file.originalname), // ✅ no extension
            format: "pdf",
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
// Upload multiple
const CloudinaryUploadMultiple = async (files) => {
    const uploaded = [];
    for (const file of files) {
        const result = await CloudinaryUpload(file);
        uploaded.push(result);
    }
    return uploaded;
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
