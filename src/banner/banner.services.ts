import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { Banner } from "./banner.schema";

/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createBanner = async (payload: {
  file?: Express.Multer.File;
  title: string;
  subtitle?: string;
}) => {
  const { file, title, subtitle } = payload;

  if (!file) {
    throw new AppError(400, "Banner image is required");
  }

  if (!title) {
    throw new AppError(400, "Banner title is required");
  }

  // Upload to Cloudinary
  const uploadResult = await fileUploader.CloudinaryUpload(file);

  // Get last order
  const lastBanner = await Banner.findOne().sort({ order: -1 });
  const order = lastBanner ? lastBanner.order + 1 : 1;

  const banner = await Banner.create({
    title,
    subtitle,
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    order,
  });

  return banner;
};

/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getBanners = async (
  sortBy: string = "order",
  sortWith: 1 | -1 = 1
) => {
  const banners = await Banner.find().sort({ [sortBy]: sortWith });
  return banners;
};

/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteBanner = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Banner id is required");
  }

  const banner = await Banner.findById(id);

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  await deleteFromCloudinary(banner.publicId);
  await Banner.findByIdAndDelete(id);

  return banner;
};

/* ------------------------------------
   DELETE ALL BANNERS
------------------------------------- */
const deleteAllBanners = async () => {
  const banners = await Banner.find();

  for (const banner of banners) {
    await deleteFromCloudinary(banner.publicId);
  }

  const result = await Banner.deleteMany({});
  return result;
};

/* ------------------------------------
   REORDER BANNERS
------------------------------------- */
const reorderBanners = async (
  items: { id: string; order: number }[]
) => {
  if (!Array.isArray(items)) {
    throw new AppError(400, "Invalid reorder payload");
  }

  const bulkOps = items.map(item => ({
    updateOne: {
      filter: { _id: item.id },
      update: { order: item.order },
    },
  }));

  await Banner.bulkWrite(bulkOps);
  return true;
};

export const BannerService = {
  createBanner,
  getBanners,
  deleteBanner,
  deleteAllBanners,
  reorderBanners,
};
