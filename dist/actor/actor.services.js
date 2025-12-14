"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorService = void 0;
const fileUpload_1 = require("../helper/fileUpload");
const actor_schema_1 = __importDefault(require("./actor.schema"));
const error_1 = require("../middleware/error");
const admin_schema_1 = require("../admin/admin.schema");
const notification_schema_1 = __importDefault(require("../notification/notification.schema"));
const createActor = async (files, data) => {
    const uploadArray = async (fileArr) => {
        if (!fileArr || fileArr.length === 0)
            return [];
        const uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(fileArr);
        return uploaded.map((u) => u.secure_url);
    };
    //  const characterPhoto= await uploadArray(files.characterPhoto);
    const frontPhoto = (await uploadArray(files.frontPhoto))[0] || null;
    const leftPhoto = (await uploadArray(files.leftPhoto))[0] || null;
    const rightPhoto = (await uploadArray(files.rightPhoto))[0] || null;
    const actorData = {
        profilePhoto: [
            {
                front: frontPhoto,
                left: leftPhoto,
                right: rightPhoto,
            },
        ],
        fullName: data.fullName,
        dob: data.dob,
        occupation: data.occupation,
        actorName: data.actorName,
        spouse: data.spouse,
        bloodGroup: data.bloodGroup,
        fromActive: data.fromActive ?? null,
        endActive: data.endActive ?? null,
        presentActive: data.endActive ? null : data.present,
        bio: data.bio ? data.bio : [],
    };
    if (!actorData) {
        throw new error_1.AppError(400, "No actor data provided");
    }
    const newActor = await actor_schema_1.default.create(actorData);
    if (!newActor) {
        throw new error_1.AppError(400, "Failed to create actor");
    }
    const admins = await admin_schema_1.Admin.find({});
    admins.forEach(async (admin) => {
        await notification_schema_1.default.create({
            senderId: newActor._id,
            recipientId: admin._id,
            type: "ACTOR_SUBMISSION",
            title: "New actor filled info",
            reference: newActor.fullName,
        });
    });
    return {
        actorinfo: newActor,
    };
};
const getSingleActor = async (actorId) => {
    if (!actorId) {
        throw new Error("No actor id provided");
    }
    const actor = await actor_schema_1.default.findById(actorId);
    if (!actor) {
        throw new Error("Actor not found");
    }
    return actor;
};
const getAllActor = async (search, page, limit, skip, category, sortBy, sortWith) => {
    let filter = {};
    const fields = ["fullName", "idNo", "presentAddress", "phoneNumber", "rank"];
    if (search) {
        filter.$or = fields.map((field) => ({
            [field]: { $regex: search.trim(), $options: "i" },
        }));
    }
    if (category === "A" || category === "B") {
        filter.category = category;
    }
    const actor = await actor_schema_1.default.find(filter)
        .sort({ [sortBy]: sortWith })
        .skip(skip)
        .limit(limit);
    const [totalActor, categoryACount, categoryBCount] = await Promise.all([
        actor_schema_1.default.countDocuments(),
        actor_schema_1.default.countDocuments({ category: "A" }),
        actor_schema_1.default.countDocuments({ category: "B" }),
    ]);
    const totalPage = Math.ceil((category === "A"
        ? categoryACount
        : category === "B"
            ? categoryBCount
            : totalActor) / limit);
    if (actor.length === 0) {
        return { actor: [], totalActor, categoryACount, categoryBCount, totalPage };
    }
    return { actor, totalActor, categoryACount, categoryBCount, totalPage };
};
// const getAllActor = async (query: ActorQuery) => {
//   const { page = 1, limit = 10, category = "A" } = query;
//   const filter: any = {};
//   // ⭐ Filter by category
//   if (category) {
//     filter.category = category;
//   }
//   const skip = (page - 1) * limit;
//   const actors = await Actor.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 }); // newest first
//   const total = await Actor.countDocuments(filter);
//   return {
//     total,
//     page,
//     limit,
//     totalPages: Math.ceil(total / limit),
//     data: actors,
//   };
// };
const filterByRank = async (rank) => {
    if (!rank) {
        throw new Error("No rank provided");
    }
    const actor = await actor_schema_1.default.find({ rank: rank });
    if (actor.length === 0) {
        throw new Error("Actor not found");
    }
    return actor;
};
exports.ActorService = {
    createActor,
    getSingleActor,
    getAllActor,
    filterByRank,
};
