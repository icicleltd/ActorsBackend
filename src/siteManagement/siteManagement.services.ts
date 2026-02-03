import { News } from "./../news/news.schema";
import { error } from "console";
import {
  ActorPayloadForMediaArchives,
  ActorPayloadForNews,
  ActorPayloadForPerformance,
  ActorPayloadForProfileUpdate,
} from "../actor/actor.interface";
import Actor from "../actor/actor.schema";
import { sanitizePayload } from "../helper/senitizePayload";
import { AppError } from "../middleware/error";
import {
  PickActorPayloadEditNews,
  PickActorPayloadForNews,
} from "./siteManagement.interface";

/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const uploadCoverImages = async (payload: { urls: string; idNo: string }) => {
  const { urls, idNo } = payload;
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
  if (!idNo) {
    throw new AppError(400, "ID No is required");
  }

  const sanitize = sanitizePayload(payloadPerformance);
  const updateSanitize = {
    ...sanitize,
  };
  const result = await Actor.findOneAndUpdate(
    { idNo },
    { $addToSet: { performanceInfo: updateSanitize } },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError(404, "Profile not updated");
  }
  return result;
};
const addProfileMediaArchives = async (
  payloadMediaArchives: ActorPayloadForMediaArchives,
  idNo: string,
) => {
  if (!idNo) {
    throw new AppError(400, "ID No is required");
  }

  const sanitize = sanitizePayload(payloadMediaArchives);
  const updateSanitize = {
    ...sanitize,
  };
  const result = await Actor.findOneAndUpdate(
    { idNo },
    { $addToSet: { mediaArchives: updateSanitize } },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError(404, "Profile not updated");
  }
  return result;
};
const addProfileNews = async (
  payloadMediaNews: PickActorPayloadForNews,
  idNo: string,
) => {
  if (!idNo) {
    throw new AppError(400, "ID No is required");
  }

  const sanitize = sanitizePayload(payloadMediaNews);
  const { idNo: _remove, published, ...rest } = sanitize;
  const updateSanitize = {
    ...rest,
    published: published ? new Date(published) : undefined,
  };
  const result = await Actor.findOneAndUpdate(
    { idNo },
    { $addToSet: { news: updateSanitize } },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError(404, "Profile not updated");
  }
  return sanitize;
};
const editProfileNews = async (
  payloadEditNews: PickActorPayloadEditNews,
  idNo: string,
) => {
  if (!idNo) {
    throw new AppError(400, "ID No is required");
  }

  const sanitize = sanitizePayload(payloadEditNews);
  const { idNo: _remove, _id, published, ...rest } = sanitize;

  const updateSanitize = {
    ...rest,
    published: published ? new Date(published) : undefined,
  };
  const result = await Actor.findOneAndUpdate(
    { idNo, "news._id": _id },
    { $set: { "news.$": { _id, ...updateSanitize } } },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError(404, "Profile not updated");
  }
  return sanitize;
};

/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteCoverPhoto = async (imageId: string, id: string) => {
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
const deleteProfilePerformance = async (imageId: string, id: string) => {
  if (!imageId || !id) {
    throw new AppError(400, "Profile performance imageId and id are required");
  }

  const performance = await Actor.findOneAndUpdate(
    {
      idNo: id,
    },
    {
      $pull: {
        performanceInfo: { _id: imageId },
      },
    },
  );

  if (!performance) {
    throw new AppError(404, "Performance not found");
  }

  // await deleteFromCloudinary(performance.publicId);

  return performance;
};
const deleteProfileMediaArchives = async (imageId: string, id: string) => {
  if (!imageId || !id) {
    throw new AppError(
      400,
      "Profile media archives imageId and id are required",
    );
  }

  const performance = await Actor.findOneAndUpdate(
    {
      idNo: id,
    },
    {
      $pull: {
        mediaArchives: { _id: imageId },
      },
    },
  );

  if (!performance) {
    throw new AppError(404, "Media archives not found");
  }

  // await deleteFromCloudinary(performance.publicId);

  return performance;
};
const deleteProfileNews = async (NewsId: string, id: string) => {
  if (!NewsId || !id) {
    throw new AppError(400, "Profile news NewsId and id are required");
  }

  const performance = await Actor.findOneAndUpdate(
    {
      idNo: id,
    },
    {
      $pull: {
        news: { _id: NewsId },
      },
    },
  );

  if (!performance) {
    throw new AppError(404, "News not found");
  }

  // await deleteFromCloudinary(performance.publicId);

  return performance;
};

export const SiteManagementService = {
  uploadCoverImages,
  getBanners,
  deleteCoverPhoto,
  updateProfileAbout,
  addProfilePerformance,
  deleteProfilePerformance,
  addProfileMediaArchives,
  deleteProfileMediaArchives,
  addProfileNews,
  deleteProfileNews,
  editProfileNews
};
