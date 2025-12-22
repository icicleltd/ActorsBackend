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
// const getAllActor = async (
//   search: string,
//   page: number,
//   limit: number,
//   skip: number,
//   category: string,
//   sortBy: string,
//   sortWith: SortOrder,
//   rankRoleSearch: string,
//   rankSearch: string
// ) => {
//   let filter: any = {};
//   const fields = ["fullName", "idNo", "presentAddress", "phoneNumber", "rank"];
//   const roles = [
//     "president",
//     "vice_president",
//     "general_secretary",
//     "joint_secretary",
//     "organizing_secretary",
//     "finance_secretary",
//     "office_secretary",
//     "event_secretary",
//     "law_welfare_secretary",
//     "publicity_secretary",
//     "it_secretary",
//     "executive_member",
//   ];
//   if (search) {
//     filter.$or = fields.map((field) => ({
//       [field]: { $regex: search.trim(), $options: "i" },
//     }));
//   }
//   if (category === "A" || category === "B") {
//     filter.category = category;
//   }
//   if (rankSearch === "executive") {
//     filter.rank = { $in: roles };
//   }
//   if (
//     rankSearch === "advisor" ||
//     rankSearch === "lifeTime" ||
//     rankSearch === "pastWay"
//   ) {
//     filter.rank = rankSearch;
//   }
//   if (rankRoleSearch) {
//     filter.rank = rankRoleSearch;
//   }
//   const actor = await Actor.find(filter)
//     .sort({ [sortBy]: sortWith })
//     .skip(skip)
//     .limit(limit);
//   const [totalActor, categoryACount, categoryBCount] = await Promise.all([
//     Actor.countDocuments(),
//     Actor.countDocuments({ category: "A" }),
//     Actor.countDocuments({ category: "B" }),
//   ]);
//   const totalPage = Math.ceil(
//     (category === "A"
//       ? categoryACount
//       : category === "B"
//       ? categoryBCount
//       : totalActor) / limit
//   );
//   if (actor.length === 0) {
//     return { actor: [], totalActor, categoryACount, categoryBCount, totalPage };
//   }
//   return { actor, totalActor, categoryACount, categoryBCount, totalPage };
// };
const ROLE_ORDER = [
    "president",
    "vice_president",
    "general_secretary",
    "joint_secretary",
    "organizing_secretary",
    "finance_secretary",
    "office_secretary",
    "event_secretary",
    "law_welfare_secretary",
    "publicity_secretary",
    "it_secretary",
    "executive_member",
];
const getAllActor = async (search, page, limit, skip, category, sortBy, sortWith, rankRoleSearch, rankSearch, searchYearRange) => {
    let filter = {};
    const fields = ["fullName", "idNo", "presentAddress", "phoneNumber", "rank"];
    /* ---------------- SEARCH ---------------- */
    if (search) {
        filter.$or = fields.map((field) => ({
            [field]: { $regex: search.trim(), $options: "i" },
        }));
    }
    /* ---------------- CATEGORY ---------------- */
    if (category === "A" || category === "B") {
        filter.category = category;
    }
    /* ---------------- YEAR RANGE FILTER ---------------- */
    if (rankSearch === "executive") {
        if (searchYearRange) {
            const [startYear, endYear] = searchYearRange.split("-").map(Number);
            // Ensure rankYearRange.start and rankYearRange.end exactly match startYear and endYear
            filter["rankYearRange.start"] = startYear; // Exact match for start year
            filter["rankYearRange.end"] = endYear; // Exact match for end year
        }
    }
    /* ---------------- RANK FILTER ---------------- */
    if (rankRoleSearch) {
        // specific role like "president"
        console.log("rankRoleSearch", rankRoleSearch);
        filter.rank = rankRoleSearch;
    }
    else if (rankSearch === "executive") {
        // executive group
        filter.rank = { $in: ROLE_ORDER };
    }
    else if (rankSearch === "advisor" ||
        rankSearch === "lifeTime" ||
        rankSearch === "pastWay") {
        filter.rank = rankSearch;
    }
    else if (rankSearch === "primeryB") {
        filter.category = "B";
    }
    else if (rankSearch === "child") {
        console.log("child");
        // Filter actors who are exactly 25 years old
        // Filter actors who are exactly 25 years old
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
        const currentDay = currentDate.getDate();
        // Calculate the range for actors who are exactly 25 years old
        const startDate = new Date(currentYear - 25, currentMonth - 1, currentDay); // 25 years ago from today
        const endDate = new Date(currentYear - 24, currentMonth - 1, currentDay); // 24 years ago from today
        // Convert the `startDate` and `endDate` to strings in the format "YYYY-MM-DD"
        const startDateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
        const endDateString = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
        // Filter for actors whose `dob` is between startDateString and endDateString
        filter.dob = { $gte: startDateString, $lt: endDateString };
    }
    else if (rankRoleSearch === "specificDob") {
        // Filter for a specific dob
        const specificDob = "1959-12-05"; // The specific dob to filter
        filter.dob = specificDob; // Match the exact dob string
    }
    /* ---------------- DATA QUERY ---------------- */
    let actor = [];
    // 🔥 EXECUTIVE → CUSTOM ROLE ORDER
    if (rankSearch === "executive") {
        actor = await actor_schema_1.default.aggregate([
            { $match: filter },
            {
                $addFields: {
                    roleOrder: {
                        $cond: {
                            if: { $in: ["$rank", ROLE_ORDER] },
                            then: { $indexOfArray: [ROLE_ORDER, "$rank"] },
                            else: 999,
                        },
                    },
                },
            },
            { $sort: { roleOrder: 1 } },
            { $skip: skip },
            { $limit: limit },
        ]);
    }
    else {
        // normal sorting
        actor = await actor_schema_1.default.find(filter)
            .sort({ [sortBy]: sortWith })
            .skip(skip)
            .limit(limit);
    }
    /* ---------------- COUNTS ---------------- */
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
    /* ---------------- RESPONSE ---------------- */
    return {
        actor,
        totalActor,
        categoryACount,
        categoryBCount,
        totalPage,
    };
};
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
// const updateActor = async (
//   payload: any,
//   files: { [fieldname: string]: Express.Multer.File[] },
//   id: string
// ) => {
//   if (!id) {
//     throw new AppError(400, "Actor ID is required");
//   }
//   if (!payload && !files) {
//     throw new AppError(400, "No data provided for update");
//   }
//   // Prepare update data
//   const updateData: any = {};
//   // Handle uploaded cover images
//   if (files?.coverImages) {
//     const coverImages = await fileUploader.CloudinaryUploadMultiple(
//       files.coverImages
//     );
//     updateData.coverImages = coverImages.map((img: any) => img.secure_url);
//   }
//   // Handle uploaded profile photo
//   if (files?.photo) {
//     const profilePhoto = await fileUploader.CloudinaryUpload(files.photo[0]);
//     updateData.photo = profilePhoto?.secure_url as any;
//   }
//   // Handle other fields from the payload
//   if (payload.name) updateData.fullName = payload.name;
//   if (payload.biography) updateData.bio = payload.biography;
//   if (payload.otherNames) updateData.otherName = payload.otherNames;
//   if (payload.occupation) updateData.occupation = payload.occupation;
//   if (payload.dob) updateData.dob = payload.dob;
//   // Ensure there is something to update
//   if (Object.keys(updateData).length === 0) {
//     throw new AppError(400, "No data provided for update");
//   }
//   // Update the actor in the database
//   const updatedActor = await Actor.findByIdAndUpdate(
//     id,
//     { $set: updateData },
//     { new: true }
//   );
//   return updatedActor;
// };
const updateActor = async (payload, files, id) => {
    if (!id) {
        throw new error_1.AppError(400, "Actor ID is required");
    }
    if (!payload && !files) {
        throw new error_1.AppError(400, "No data provided for update");
    }
    console.log(id);
    console.log(payload);
    // Prepare update data
    const updateData = {};
    // Handle uploaded profile photo
    if (files?.photo) {
        const uploaded = (await fileUpload_1.fileUploader.CloudinaryUpload(files.photo[0]));
        updateData.photo = uploaded.secure_url;
    }
    // Handle uploaded cover images
    if (files?.coverImages) {
        const coverImages = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(files.coverImages);
        updateData.coverImages = coverImages.map((img) => {
            const uploaded = img;
            return uploaded.secure_url;
        });
    }
    // Handle other fields from the payload
    if (payload.name)
        updateData.fullName = payload.name;
    if (payload.biography)
        updateData.bio = payload.biography;
    if (payload.otherNames)
        updateData.otherName = payload.otherNames;
    if (payload.occupation)
        updateData.occupation = payload.occupation;
    if (payload.dob)
        updateData.dob = payload.dob;
    // Ensure there is something to update
    if (Object.keys(updateData).length === 0) {
        throw new error_1.AppError(400, "No data provided for update");
    }
    console.log(updateData);
    // Update the actor in the database
    const updatedActor = await actor_schema_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return updatedActor;
};
exports.default = {
    updateActor,
};
exports.ActorService = {
    createActor,
    getSingleActor,
    getAllActor,
    filterByRank,
    updateActor,
};
