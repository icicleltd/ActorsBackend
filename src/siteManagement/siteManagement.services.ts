
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
import Portfolio from "./protfolio.schems";

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

const getPortfolio = async (idNo: string, page: number = 1, limit: number = 12, tabId: string = "ALL") => {
  const actorId = await Actor.findOne({ idNo: idNo }).select("_id").lean();
  if (!actorId) {
    throw new AppError(400, "This actor not found");
  }
  const skip = (page - 1) * limit;
    // Fetch the portfolio for the actor
  const portfolio = await Portfolio.findOne({ actorId: actorId._id }).select("tabs").lean();

  if (!portfolio) {
    throw new AppError(404, "Portfolio not found");
  }

  // Build aggregation pipeline
  let pipeline: any[] = [
    // Match the portfolio by actorId
    { $match: { actorId: actorId._id } },

    // Unwind the tabs array to allow filtering by tab ID
    { $unwind: "$tabs" },
  ];

  // If a specific tab is selected, filter by tab ID
  if (tabId !== "ALL") {
    pipeline.push({ $match: { "tabs._id": tabId } });
  }

  // Unwind the works array so we can paginate it
  // pipeline.push(
  //   { $unwind: "$tabs.works" },

  //   // Add a new field for the tab label
  //   {
  //     $addFields: {
  //       "tabs.works.tabLabel": "$tabs.label",
  //     },
  //   },

  //   // Replace the root document with just the works
  //   { $replaceRoot: { newRoot: "$tabs.works" } }
  // );

  // Count the total number of works (for pagination metadata)
  const countPipeline = [...pipeline, { $count: "total" }];

  // Add pagination stage
  pipeline.push(
    { $skip: skip },
    { $limit: limit }
  );

  // Execute both pipelines
  const [works, totalCountResult] = await Promise.all([
    Portfolio.aggregate(pipeline),
    Portfolio.aggregate(countPipeline),
  ]);

  const totalWorks = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

  return {
    tabs: portfolio.tabs,
    works,
    totalWorks,
    totalPages: Math.ceil(totalWorks / limit),
    currentPage: page,
  };
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
  console.log(updateSanitize)
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
const deleteTab = async (tabId: string, id: string) => {
  if (!tabId || !id) {
    throw new AppError(400, " tabId and id are required");
  }

  const actor = await Actor.findOne({ idNo: id });
  if (!actor) {
    throw new AppError(404, "Actor not found");
  }
  const existingTab = await Portfolio.findOne({
    actorId: actor._id,
    tabs: { $elemMatch: { _id: tabId } },
  });
  if (!existingTab) {
    throw new AppError(400, `This tab not exists`);
  }
  const result = await Portfolio.findOneAndUpdate(
    { actorId: actor._id },
    { $pull: { tabs: { _id: tabId } } },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "work not found");
  }

  // await deleteFromCloudinary(performance.publicId);

  return result;
};
const deleteWork = async (tabId: string, workId: string, id: string) => {
  if (!tabId || !workId || !id) {
    throw new AppError(400, "Profile news NewsId and id are required");
  }

  const actor = await Actor.findOne({ idNo: id });
  if (!actor) {
    throw new AppError(404, "Actor not found");
  }
  const existingTab = await Portfolio.findOne({
    actorId: actor._id,
    tabs: { $elemMatch: { _id: tabId } },
  });
  if (!existingTab) {
    throw new AppError(400, `This tab not exists`);
  }
  const result = await Portfolio.findOneAndUpdate(
    { actorId: actor._id, "tabs._id": tabId },
    { $pull: { "tabs.$.works": { _id: workId } } },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, "work not found");
  }

  // await deleteFromCloudinary(performance.publicId);

  return result;
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

const createTabs = async (payload: any, idNo: string) => {
  const { id, label } = payload;
  if (!idNo) {
    throw new AppError(400, "Actor ID No is required");
  }
  if (!id || !label) {
    throw new AppError(400, "Tab id and label are required");
  }
  const actor = await Actor.findOne({ idNo: idNo });
  if (!actor) {
    throw new AppError(404, "Actor not found");
  }
  const existingTab = await Portfolio.findOne({
    actorId: actor._id,
    tabs: { $elemMatch: { id: id } },
  });
  if (existingTab) {
    throw new AppError(400, `Tab with id "${id}" already exists`);
  }
  const tab = {
    id,
    label,
  };
  const result = await Portfolio.findOneAndUpdate(
    { actorId: actor._id },
    { $addToSet: { tabs: tab } },
    { new: true, upsert: true },
  );
  if (!result) {
    throw new AppError(500, "Failed to create tab");
  }
  return result;
};
const uploadWorks = async (payload: any, idNo: string) => {
  const { image, description, _id } = payload;
  if (!idNo) {
    throw new AppError(400, "Actor ID No is required");
  }
  if (!image) {
    throw new AppError(400, "Image is required");
  }
  if (!_id) {
    throw new AppError(400, "Tab _id is required");
  }

  const actor = await Actor.findOne({ idNo: idNo });
  if (!actor) {
    throw new AppError(404, "Actor not found");
  }
  const existingTab = await Portfolio.findOne({
    actorId: actor._id,
    tabs: { $elemMatch: { _id: _id } },
  });
  if (!existingTab) {
    throw new AppError(400, `This tab not exists`);
  }
  const works = {
    image,
    description,
  };
  // output = >{ image: 'image1', description: 'description1' }
  const result = await Portfolio.findOneAndUpdate(
    { actorId: actor._id, "tabs._id": _id },
    { $push: { "tabs.$.works": works } },
    { new: true },
  );
  if (!result) {
    throw new AppError(500, "Failed to Upload work");
  }
  return result;
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
  editProfileNews,
  createTabs,
  uploadWorks,
  getPortfolio,
  deleteWork,
  deleteTab
};
