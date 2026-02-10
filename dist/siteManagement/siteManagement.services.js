"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteManagementService = void 0;
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const senitizePayload_1 = require("../helper/senitizePayload");
const error_1 = require("../middleware/error");
const protfolio_schems_1 = __importDefault(require("./protfolio.schems"));
/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const uploadCoverImages = async (payload) => {
    const { urls, idNo } = payload;
    if (!urls) {
        throw new error_1.AppError(400, "Urls and idNo required");
    }
    const result = await actor_schema_1.default.findOneAndUpdate({
        idNo: idNo,
    }, {
        $addToSet: {
            coverImages: { url: urls },
        },
    });
    if (!result) {
        throw new error_1.AppError(404, "Banner not created");
    }
    return urls;
};
/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getBanners = async (sortBy = "order", sortWith = 1) => {
    const banners = await actor_schema_1.default.find().sort({ [sortBy]: sortWith });
    return banners;
};
const getPortfolio = async (idNo, page = 1, limit = 12, tabId = "ALL") => {
    const actorId = await actor_schema_1.default.findOne({ idNo: idNo }).select("_id").lean();
    if (!actorId) {
        throw new error_1.AppError(400, "This actor not found");
    }
    const skip = (page - 1) * limit;
    // Fetch the portfolio for the actor
    const portfolio = await protfolio_schems_1.default.findOne({ actorId: actorId._id }).select("tabs").lean();
    if (!portfolio) {
        throw new error_1.AppError(404, "Portfolio not found");
    }
    // Build aggregation pipeline
    let pipeline = [
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
    pipeline.push({ $skip: skip }, { $limit: limit });
    // Execute both pipelines
    const [works, totalCountResult] = await Promise.all([
        protfolio_schems_1.default.aggregate(pipeline),
        protfolio_schems_1.default.aggregate(countPipeline),
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
const updateProfileAbout = async (profileData, idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "ID No is required");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(profileData);
    const updateSanitize = {
        ...sanitize,
        height: {
            feet: Number(sanitize.heightFeet),
            inches: Number(sanitize.heightInch),
        },
    };
    try {
        const result = await actor_schema_1.default.findOneAndUpdate({ idNo }, { $set: updateSanitize }, { new: true, runValidators: true });
        if (!result) {
            throw new error_1.AppError(404, "Profile not updated");
        }
        return result;
    }
    catch (error) {
        console.log(error);
    }
};
const addProfilePerformance = async (payloadPerformance, idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "ID No is required");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(payloadPerformance);
    const updateSanitize = {
        ...sanitize,
    };
    const result = await actor_schema_1.default.findOneAndUpdate({ idNo }, { $addToSet: { performanceInfo: updateSanitize } }, { new: true, runValidators: true });
    if (!result) {
        throw new error_1.AppError(404, "Profile not updated");
    }
    return result;
};
const addProfileMediaArchives = async (payloadMediaArchives, idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "ID No is required");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(payloadMediaArchives);
    const updateSanitize = {
        ...sanitize,
    };
    const result = await actor_schema_1.default.findOneAndUpdate({ idNo }, { $addToSet: { mediaArchives: updateSanitize } }, { new: true, runValidators: true });
    if (!result) {
        throw new error_1.AppError(404, "Profile not updated");
    }
    return result;
};
const addProfileNews = async (payloadMediaNews, idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "ID No is required");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(payloadMediaNews);
    const { idNo: _remove, published, ...rest } = sanitize;
    const updateSanitize = {
        ...rest,
        published: published ? new Date(published) : undefined,
    };
    const result = await actor_schema_1.default.findOneAndUpdate({ idNo }, { $addToSet: { news: updateSanitize } }, { new: true, runValidators: true });
    if (!result) {
        throw new error_1.AppError(404, "Profile not updated");
    }
    return sanitize;
};
const editProfileNews = async (payloadEditNews, idNo) => {
    if (!idNo) {
        throw new error_1.AppError(400, "ID No is required");
    }
    const sanitize = (0, senitizePayload_1.sanitizePayload)(payloadEditNews);
    const { idNo: _remove, _id, published, ...rest } = sanitize;
    const updateSanitize = {
        ...rest,
        published: published ? new Date(published) : undefined,
    };
    const result = await actor_schema_1.default.findOneAndUpdate({ idNo, "news._id": _id }, { $set: { "news.$": { _id, ...updateSanitize } } }, { new: true, runValidators: true });
    if (!result) {
        throw new error_1.AppError(404, "Profile not updated");
    }
    return sanitize;
};
/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteCoverPhoto = async (imageId, id) => {
    if (!imageId || !id) {
        throw new error_1.AppError(400, "Cover imageId and id are required");
    }
    const banner = await actor_schema_1.default.findOneAndUpdate({
        idNo: id,
    }, {
        $pull: {
            coverImages: { _id: imageId },
        },
    });
    if (!banner) {
        throw new error_1.AppError(404, "Banner not found");
    }
    // await deleteFromCloudinary(banner.publicId);
    return banner;
};
const deleteProfilePerformance = async (imageId, id) => {
    if (!imageId || !id) {
        throw new error_1.AppError(400, "Profile performance imageId and id are required");
    }
    const performance = await actor_schema_1.default.findOneAndUpdate({
        idNo: id,
    }, {
        $pull: {
            performanceInfo: { _id: imageId },
        },
    });
    if (!performance) {
        throw new error_1.AppError(404, "Performance not found");
    }
    // await deleteFromCloudinary(performance.publicId);
    return performance;
};
const deleteProfileMediaArchives = async (imageId, id) => {
    if (!imageId || !id) {
        throw new error_1.AppError(400, "Profile media archives imageId and id are required");
    }
    const performance = await actor_schema_1.default.findOneAndUpdate({
        idNo: id,
    }, {
        $pull: {
            mediaArchives: { _id: imageId },
        },
    });
    if (!performance) {
        throw new error_1.AppError(404, "Media archives not found");
    }
    // await deleteFromCloudinary(performance.publicId);
    return performance;
};
const deleteTab = async (tabId, id) => {
    if (!tabId || !id) {
        throw new error_1.AppError(400, " tabId and id are required");
    }
    const actor = await actor_schema_1.default.findOne({ idNo: id });
    if (!actor) {
        throw new error_1.AppError(404, "Actor not found");
    }
    const existingTab = await protfolio_schems_1.default.findOne({
        actorId: actor._id,
        tabs: { $elemMatch: { _id: tabId } },
    });
    if (!existingTab) {
        throw new error_1.AppError(400, `This tab not exists`);
    }
    const result = await protfolio_schems_1.default.findOneAndUpdate({ actorId: actor._id }, { $pull: { tabs: { _id: tabId } } }, { new: true });
    if (!result) {
        throw new error_1.AppError(404, "work not found");
    }
    // await deleteFromCloudinary(performance.publicId);
    return result;
};
const deleteWork = async (tabId, workId, id) => {
    if (!tabId || !workId || !id) {
        throw new error_1.AppError(400, "Profile news NewsId and id are required");
    }
    const actor = await actor_schema_1.default.findOne({ idNo: id });
    if (!actor) {
        throw new error_1.AppError(404, "Actor not found");
    }
    const existingTab = await protfolio_schems_1.default.findOne({
        actorId: actor._id,
        tabs: { $elemMatch: { _id: tabId } },
    });
    if (!existingTab) {
        throw new error_1.AppError(400, `This tab not exists`);
    }
    const result = await protfolio_schems_1.default.findOneAndUpdate({ actorId: actor._id, "tabs._id": tabId }, { $pull: { "tabs.$.works": { _id: workId } } }, { new: true });
    if (!result) {
        throw new error_1.AppError(404, "work not found");
    }
    // await deleteFromCloudinary(performance.publicId);
    return result;
};
const deleteProfileNews = async (NewsId, id) => {
    if (!NewsId || !id) {
        throw new error_1.AppError(400, "Profile news NewsId and id are required");
    }
    const performance = await actor_schema_1.default.findOneAndUpdate({
        idNo: id,
    }, {
        $pull: {
            news: { _id: NewsId },
        },
    });
    if (!performance) {
        throw new error_1.AppError(404, "News not found");
    }
    // await deleteFromCloudinary(performance.publicId);
    return performance;
};
const createTabs = async (payload, idNo) => {
    const { id, label } = payload;
    if (!idNo) {
        throw new error_1.AppError(400, "Actor ID No is required");
    }
    if (!id || !label) {
        throw new error_1.AppError(400, "Tab id and label are required");
    }
    const actor = await actor_schema_1.default.findOne({ idNo: idNo });
    if (!actor) {
        throw new error_1.AppError(404, "Actor not found");
    }
    const existingTab = await protfolio_schems_1.default.findOne({
        actorId: actor._id,
        tabs: { $elemMatch: { id: id } },
    });
    if (existingTab) {
        throw new error_1.AppError(400, `Tab with id "${id}" already exists`);
    }
    const tab = {
        id,
        label,
    };
    const result = await protfolio_schems_1.default.findOneAndUpdate({ actorId: actor._id }, { $addToSet: { tabs: tab } }, { new: true, upsert: true });
    if (!result) {
        throw new error_1.AppError(500, "Failed to create tab");
    }
    return result;
};
const uploadWorks = async (payload, idNo) => {
    const { image, description, _id } = payload;
    if (!idNo) {
        throw new error_1.AppError(400, "Actor ID No is required");
    }
    if (!image) {
        throw new error_1.AppError(400, "Image is required");
    }
    if (!_id) {
        throw new error_1.AppError(400, "Tab _id is required");
    }
    const actor = await actor_schema_1.default.findOne({ idNo: idNo });
    if (!actor) {
        throw new error_1.AppError(404, "Actor not found");
    }
    const existingTab = await protfolio_schems_1.default.findOne({
        actorId: actor._id,
        tabs: { $elemMatch: { _id: _id } },
    });
    if (!existingTab) {
        throw new error_1.AppError(400, `This tab not exists`);
    }
    const works = {
        image,
        description,
    };
    // output = >{ image: 'image1', description: 'description1' }
    const result = await protfolio_schems_1.default.findOneAndUpdate({ actorId: actor._id, "tabs._id": _id }, { $push: { "tabs.$.works": works } }, { new: true });
    if (!result) {
        throw new error_1.AppError(500, "Failed to Upload work");
    }
    return result;
};
exports.SiteManagementService = {
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
