import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { Sponcer } from "./sponcer.schema";


/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createSponcer = async (payload: { title: string; url: string }) => {
  const { title, url } = payload;
  if (!url) {
    throw new AppError(400, "Url required");
  }
  console.log(payload);
  const result = await Sponcer.create({
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
const getSponcer = async (sortBy: string = "order", sortWith: 1 | -1 = 1) => {
  const banners = await Sponcer.find().sort({ order: 1 });
  return banners;
};

/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteSponcer = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Banner id is required");
  }

  const banner = await Sponcer.findById(id);

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  // await deleteFromCloudinary(banner.publicId);
  await Sponcer.findByIdAndDelete(id);

  return banner;
};



export const SponcerService = {
  createSponcer,
  getSponcer,
  deleteSponcer,
};
