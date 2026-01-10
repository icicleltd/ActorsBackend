import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { Gallery } from "./galary.schema";

/* ------------------------------------
   UPLOAD IMAGES
------------------------------------- */
const createGalleryImages = async (files: {
  [fieldname: string]: Express.Multer.File[];
}) => {
  if (!files || !files.images || files.images.length === 0) {
    throw new AppError(400, "Images are required");
  }

  const uploaded = await fileUploader.CloudinaryUploadMultiple(files.images);

  const images = uploaded.map((u: any) => ({
    publicId: u.public_id,
    image: u.secure_url,
  }));

  const result = await Gallery.create(images);
  return result;
};

/* ------------------------------------
   GET ALL IMAGES (Frontend/Admin)
------------------------------------- */
const getGalleryImages = async (
  skip: number,
  limit: number,
  sortBy: string,
  sortWith: 1 | -1
) => {
  // const images = await Gallery.find()
  //   .sort({ [sortBy]: sortWith })
  //   .skip(skip)
  //   .limit(limit);

  // if (!images.length) {
  //   throw new AppError(404, "No gallery images found");
  // }
  const [images, total] = await Promise.all([
    Gallery.find()
      .sort({ [sortBy]: sortWith })
      .skip(skip)
      .limit(limit),
    Gallery.countDocuments(),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {images,total,totalPages};
};

/* ------------------------------------
   DELETE SINGLE IMAGE
------------------------------------- */
const deleteGalleryImage = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Gallery image id is required");
  }

  const image = await Gallery.findById(id);

  if (!image) {
    throw new AppError(404, "Gallery image not found");
  }

  await deleteFromCloudinary(image.publicId);
  await Gallery.findByIdAndDelete(id);

  return image;
};

/* ------------------------------------
   DELETE ALL IMAGES
------------------------------------- */
const deleteAllGalleryImages = async () => {
  const result = await Gallery.deleteMany({});
  return result;
};

export const GalleryService = {
  createGalleryImages,
  getGalleryImages,
  deleteGalleryImage,
  deleteAllGalleryImages,
};
