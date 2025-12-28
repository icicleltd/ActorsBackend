import { fileUploader } from "../helper/fileUpload";
import Actor from "./actor.schema";
import { AppError } from "../middleware/error";
import { Admin } from "../admin/admin.schema";
import Notification from "../notification/notification.schema";
import type { SortOrder } from "mongoose";

const createActor = async (files: any, data: any) => {
  const uploadArray = async (fileArr: any[]) => {
    if (!fileArr || fileArr.length === 0) return [];
    const uploaded = await fileUploader.CloudinaryUploadMultiple(fileArr);
    return uploaded.map((u: any) => u.secure_url);
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
    throw new AppError(400, "No actor data provided");
  }
  const newActor = await Actor.create(actorData);
  if (!newActor) {
    throw new AppError(400, "Failed to create actor");
  }
  const admins = await Admin.find({});

  admins.forEach(async (admin) => {
    await Notification.create({
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

const getSingleActor = async (actorId: string) => {
  if (!actorId) {
    throw new Error("No actor id provided");
  }
  const actor = await Actor.findById(actorId);
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

const getAllActor = async (
  search: string,
  page: number,
  limit: number,
  skip: number,
  category: string,
  sortBy: string,
  sortWith: SortOrder,
  executiveRank: string,
  rankGroup: string,
  searchYearRange: string
) => {
  let filter: any = {};
  const fields = ["fullName", "idNo", "presentAddress", "phoneNumber", "rank"];

  /* ---------------- SEARCH ---------------- */
  if (search) {
    const words = search.trim().split(/\s+/);

    filter.$and = words.map((word) => ({
      $or: fields.map((field) => ({
        [field]: { $regex: word, $options: "i" },
      })),
    }));
  }

  /* ---------------- CATEGORY ---------------- */
  if (["A", "B", "C"].includes(category)) {
    console.log(category);
    filter.category = category;
  }

  /* ---------------- RANK Group filter ---------------- */
  let yearFilter: any = {};
  if (rankGroup === "executive") {
    console.log(rankGroup);
    filter.rankHistory = {
      $elemMatch: {
        rank: { $in: ROLE_ORDER },
      },
    };
  }

  if (searchYearRange) {
    console.log(searchYearRange);
    const [startYear, endYear] = searchYearRange.split("-").map(Number);
    yearFilter = {
      "rankHistory.start": startYear,
      "rankHistory.end": endYear,
    };
  }

  /* ---------------- executive role ---------------- */
  if (executiveRank) {
    // specific role like "president"
    console.log("executiveRank", executiveRank);
    filter.rankHistory = {
      $elemMatch: {
        rank: executiveRank,
      },
    };
  } else if (
    rankGroup === "advisor" ||
    rankGroup === "lifeTime" ||
    rankGroup === "pastWay"
  ) {
    filter.rankHistory = {
      $elemMatch: {
        rank: rankGroup,
      },
    };
  } else if (rankGroup === "primeryB") {
    filter.category = "B";
  } else if (rankGroup === "child") {
    filter.category = "C";
  }

  // if (rankGroup === "executive" && searchYearRange) {
  //   filter.rankHistory = {
  //     $elemMatch: {
  //       rank: { $in: ROLE_ORDER },
  //       // ...yearFilter
  //     },
  //   };
  // }

  /* ---------------- DATA QUERY ---------------- */
  let actor: any[] = [];

  // CUSTOM ROLE ORDER
  if (rankGroup === "executive") {
    actor = await Actor.aggregate([
      { $match: filter },
      { $unwind: "$rankHistory" },
      {
        $match: {
          "rankHistory.rank": { $in: ROLE_ORDER },
          ...yearFilter,
        },
      },

      {
        $addFields: {
          roleOrder: {
            $cond: {
              if: { $in: ["$rankHistory.rank", ROLE_ORDER] },
              then: { $indexOfArray: [ROLE_ORDER, "$rankHistory.rank"] },
              else: 999,
            },
          },
        },
      },

      { $sort: { "rankHistory.end": -1, roleOrder: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          password: 0,
        },
      },
    ]);
  } else {
    // normal sorting
    actor = await Actor.find(filter)
      .select("-password")
      .sort({ [sortBy]: sortWith })
      .skip(skip)
      .limit(limit);
  }

  /* ---------------- COUNTS ---------------- */
  const [totalActor, categoryACount, categoryBCount, categoryCCount] =
    await Promise.all([
      Actor.countDocuments(),
      Actor.countDocuments({ category: "A" }),
      Actor.countDocuments({ category: "B" }),
      Actor.countDocuments({ category: "C" }),
    ]);
  const filteredCount = await Actor.countDocuments(filter);

  const totalPage = Math.ceil(
    (category === "A"
      ? categoryACount
      : category === "B"
      ? categoryBCount
      : category === "C"
      ? categoryCCount
      : totalActor) / limit
  );
  /* ---------------- RESPONSE ---------------- */
  return {
    actor,
    totalActor,
    categoryACount,
    categoryBCount,
    categoryCCount,
    totalPage,
  };
};

const filterByRank = async (rank: string) => {
  console.log(rank);
  if (!rank) {
    throw new Error("No rank provided");
  }
  // const actor = await Actor.find({ rank: rank });
  const actor = await Actor.aggregate([
    { $unwind: "$rankHistory" },
    {
      $match: {
        $rank: rank,
      },
    },
  ]);
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
const updateActor = async (
  payload: any,
  files: { [fieldname: string]: Express.Multer.File[] },
  id: string
) => {
  if (!id) {
    throw new AppError(400, "Actor ID is required");
  }

  if (!payload && !files) {
    throw new AppError(400, "No data provided for update");
  }
  // Prepare update data
  const updateData: any = {};

  // Handle uploaded profile photo
  if (files?.photo) {
    const uploaded = (await fileUploader.CloudinaryUpload(files.photo[0])) as {
      secure_url: string;
    };
    updateData.photo = uploaded.secure_url;
  }

  // Handle uploaded cover images
  if (files?.coverImages) {
    const coverImages = await fileUploader.CloudinaryUploadMultiple(
      files.coverImages
    );
    updateData.coverImages = coverImages.map((img) => {
      const uploaded = img as { secure_url: string };
      return uploaded.secure_url;
    });
  }

  // Handle other fields from the payload
  if (payload.name) updateData.fullName = payload.name;
  if (payload.biography) updateData.bio = payload.biography;
  if (payload.otherNames) updateData.otherName = payload.otherNames;
  if (payload.occupation) updateData.occupation = payload.occupation;
  if (payload.dob) updateData.dob = payload.dob;

  // Ensure there is something to update
  if (Object.keys(updateData).length === 0) {
    throw new AppError(400, "No data provided for update");
  }
  // Update the actor in the database
  const newActor = await Actor.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );
  return newActor;
};

export default {
  updateActor,
};

export const ActorService = {
  createActor,
  getSingleActor,
  getAllActor,
  filterByRank,
  updateActor,
};
