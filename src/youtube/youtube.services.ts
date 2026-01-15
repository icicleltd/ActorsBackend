import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { Youtube } from "./youtube.schema";

/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createYoutbe = async (payload: { title: string; url: string }) => {
  const { title, url } = payload;
  if (!url) {
    throw new AppError(400, "Url required");
  }
  console.log(payload);
  const result = await Youtube.create({
    title,
    url,
  });
  console.log(result);
  if (!result) {
    throw new AppError(404, "Banner not created");
  }
  return result;
};

/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getYoutube = async (sortBy: string = "order", sortWith: 1 | -1 = 1) => {
  const banners = await Youtube.find().sort({ order: 1 });
  return banners;
};

/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteYoutube = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Banner id is required");
  }

  const banner = await Youtube.findById(id);

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  // await deleteFromCloudinary(banner.publicId);
  await Youtube.findByIdAndDelete(id);

  return banner;
};



export const YoutubeService = {
  createYoutbe,
  getYoutube,
  deleteYoutube,
};
