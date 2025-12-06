"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(process.cwd(), "uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = file.originalname.substring(file.originalname.lastIndexOf("."));
        cb(null, file.fieldname + "-" + uniqueSuffix + extension);
    },
});
const upload = (0, multer_1.default)({ storage });
// Cloudinary config
cloudinary_1.v2.config({
    cloud_name: "dk4ltobvb",
    api_key: "548264937859395",
    api_secret: "6_MiNGp0BDmahMzIP0V-WDeygVE",
});
// Single upload
const CloudinaryUpload = async (filePath) => {
    const uploadResult = await cloudinary_1.v2.uploader
        .upload(filePath.path, { public_id: filePath.filename })
        .catch((error) => {
        throw new Error(error.message);
    });
    if (uploadResult)
        fs_1.default.unlinkSync(filePath.path);
    return uploadResult;
};
// Multiple upload
const CloudinaryUploadMultiple = async (files) => {
    const uploaded = [];
    for (const file of files) {
        const result = await CloudinaryUpload(file);
        uploaded.push(result);
    }
    return uploaded;
};
exports.fileUploader = {
    upload,
    CloudinaryUpload,
    CloudinaryUploadMultiple,
};
