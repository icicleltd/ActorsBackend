import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { UTApi, UTFile } from "uploadthing/server";
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

// UploadThing client
const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN!,
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

export interface UploadThingResult {
  url: string;
  name: string;
  key: string;
  size: number;
}
const toArrayBuffer = (buffer: Buffer): ArrayBuffer =>
  buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;

// ✅ Single PDF upload — replaces CloudinaryUploadPDF
const UploadThingUploadPDF = async (
  file: Express.Multer.File,
): Promise<UploadThingResult> => {
  if (file.mimetype !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  const utFile = new UTFile([toArrayBuffer(file.buffer)], file.originalname, {
    type: "application/pdf",
  });

  const [result] = await utapi.uploadFiles([utFile]);

  if (result.error) throw new Error(result.error.message);

  return {
    url: result.data.ufsUrl,
    name: result.data.name,
    key: result.data.key,
    size: result.data.size,
  };
};

// ✅ Multiple PDF upload — replaces CloudinaryUploadMultiplePDF
const UploadThingUploadMultiplePDF = async (
  files: Express.Multer.File[],
): Promise<UploadThingResult[]> => {
  const invalidFile = files.find((f) => f.mimetype !== "application/pdf");
  if (invalidFile) throw new Error("Only PDF files are allowed");

  const utFiles = files.map(
    (file) =>
      new UTFile([toArrayBuffer(file.buffer)], file.originalname, { type: "application/pdf" }),
  );

  const results = await utapi.uploadFiles(utFiles);

  return results.map((result) => {
    if (result.error) throw new Error(result.error.message);
    return {
      url: result.data.ufsUrl,
      name: result.data.name,
      key: result.data.key,
      size: result.data.size,
    };
  });
};

// ✅ Delete PDF by key (replaces deleteFromCloudinary for PDFs)
export const deleteFromUploadThing = async (key: string) => {
  return utapi.deleteFiles([key]);
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
  // PDFs → UploadThing
  UploadThingUploadPDF,
  UploadThingUploadMultiplePDF,
};
