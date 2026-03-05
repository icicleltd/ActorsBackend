import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

// Multer memory storage (required for Vercel)
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary config personal account
// cloudinary.config({
//   cloud_name: "dk4ltobvb",
//   api_key: "548264937859395",
//   api_secret: "6_MiNGp0BDmahMzIP0V-WDeygVE",
// });
// Cloudinary config office account
cloudinary.config({
  cloud_name: "dgywkhtxz",
  api_key: "967534559333113",
  api_secret: "W0Lr6YQocCLQAZ1SYuazvR4e128",
});

const getPublicId = (filename: string, folder = "uploads") => {
  const name = path.parse(filename).name;
  return `${folder}/${Date.now()}-${name}`;
};

// ✅ Single image upload
const CloudinaryUpload = async (file: Express.Multer.File) => {
  // console.log("file",file)
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: getPublicId(file.originalname) }, // ✅ no extension
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(file.buffer);
  });
};

// ✅ Single PDF upload
const CloudinaryUploadPDF = async (file: Express.Multer.File) => {
  if (file.mimetype !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "pdfs",
        public_id: getPublicId(file.originalname), // ✅ no extension
        format: "pdf",
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(file.buffer);
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

const CloudinaryUploadMultiplePDF = async (files: Express.Multer.File[]) => {
  const uploaded = [];

  for (const file of files) {
    const result = await CloudinaryUploadPDF(file);
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
  CloudinaryUploadPDF,
  CloudinaryUploadMultiplePDF,
};
