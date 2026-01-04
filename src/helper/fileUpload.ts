import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Multer memory storage (required for Vercel)
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary config
cloudinary.config({
  cloud_name: "dk4ltobvb",
  api_key: "548264937859395",
  api_secret: "6_MiNGp0BDmahMzIP0V-WDeygVE",
});

// Upload single file (buffer)
const CloudinaryUpload = async (file: Express.Multer.File) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: file.originalname },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer); // send raw buffer
  });
};

// Upload multiple
const CloudinaryUploadMultiple = async (files: Express.Multer.File[]) => {
  const uploaded = [];
  for (const file of files) {
    const result = await CloudinaryUpload(file);
    uploaded.push(result);
  }
  return uploaded;
};

export const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export const fileUploader = {
  upload,
  CloudinaryUpload,
  CloudinaryUploadMultiple,
};
