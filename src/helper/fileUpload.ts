import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.substring(file.originalname.lastIndexOf("."));
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const upload = multer({ storage });

// Cloudinary config
cloudinary.config({
  cloud_name: "dk4ltobvb",
  api_key: "548264937859395",
  api_secret: "6_MiNGp0BDmahMzIP0V-WDeygVE",
});

// Single upload
const CloudinaryUpload = async (filePath: any) => {
  const uploadResult = await cloudinary.uploader
    .upload(filePath.path, { public_id: filePath.filename })
    .catch((error) => {
      throw new Error(error.message);
    });

  if (uploadResult) fs.unlinkSync(filePath.path);

  return uploadResult;
};

// Multiple upload
const CloudinaryUploadMultiple = async (files: any[]) => {
  const uploaded = [];

  for (const file of files) {
    const result = await CloudinaryUpload(file);
    uploaded.push(result);
  }

  return uploaded;
};

export const fileUploader = {
  upload,
  CloudinaryUpload,
  CloudinaryUploadMultiple,
};
