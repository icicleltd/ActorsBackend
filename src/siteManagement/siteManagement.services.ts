import { error } from "console";
import {
  ActorPayloadForPerformance,
  ActorPayloadForProfileUpdate,
} from "../actor/actor.interface";
import Actor from "../actor/actor.schema";
import { sanitizePayload } from "../helper/senitizePayload";
import { AppError } from "../middleware/error";

/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const uploadCoverImages = async (payload: { urls: string; idNo: string }) => {
  const { urls, idNo } = payload;
  console.log(payload);
  if (!urls) {
    throw new AppError(400, "Urls and idNo required");
  }
  const result = await Actor.findOneAndUpdate(
    {
      idNo: idNo,
    },
    {
      $addToSet: {
        coverImages: { url: urls },
      },
    },
  );
  if (!result) {
    throw new AppError(404, "Banner not created");
  }
  return urls;
};

/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getBanners = async (sortBy: string = "order", sortWith: 1 | -1 = 1) => {
  const banners = await Actor.find().sort({ [sortBy]: sortWith });
  return banners;
};

const updateProfileAbout = async (
  profileData: ActorPayloadForProfileUpdate,
  idNo: string,
) => {
  if (!idNo) {
    throw new AppError(400, "ID No is required");
  }
  const sanitize = sanitizePayload(profileData);
  const updateSanitize = {
    ...sanitize,
    height: {
      feet: Number(sanitize.heightFeet),
      inches: Number(sanitize.heightInch),
    },
  };
  try {
    const result = await Actor.findOneAndUpdate(
      { idNo },
      { $set: updateSanitize },
      { new: true, runValidators: true },
    );
    if (!result) {
      throw new AppError(404, "Profile not updated");
    }
    return result;
  } catch (error) {
    console.log(error);
  }
};
const addProfilePerformance = async (
  payloadPerformance: ActorPayloadForPerformance,
  idNo: string,
) => {
    console.log("performance", payloadPerformance);
  if (!idNo) {
    throw new AppError(400, "ID No is required");
  }

  const sanitize = sanitizePayload(payloadPerformance);
  console.log(sanitize);
  const updateSanitize = {
    ...sanitize,
  };
  const result = await Actor.findOneAndUpdate(
    { idNo },
    { $addToSet: { performanceInfo: updateSanitize } },
    { new: true, runValidators: true },
  );
  console.log("result", result);
  if (!result) {
    throw new AppError(404, "Profile not updated");
  }
  return result;
};

/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteCoverPhoto = async (imageId: string, id: string) => {
  console.log(imageId, id);
  if (!imageId || !id) {
    throw new AppError(400, "Cover imageId and id are required");
  }

  const banner = await Actor.findOneAndUpdate(
    {
      idNo: id,
    },
    {
      $pull: {
        coverImages: { _id: imageId },
      },
    },
  );

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  // await deleteFromCloudinary(banner.publicId);

  return banner;
};

export const SiteManagementService = {
  uploadCoverImages,
  getBanners,
  deleteCoverPhoto,
  updateProfileAbout,
  addProfilePerformance,
};
