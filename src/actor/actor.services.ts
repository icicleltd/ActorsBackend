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
  rankRoleSearch: string,
  rankSearch: string,
  searchYearRange: string
) => {
  let filter: any = {};
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
  if(rankSearch === "executive"){

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
    console.log("rankRoleSearch",rankRoleSearch)
    filter.rank = rankRoleSearch;
  } else if (rankSearch === "executive") {
    // executive group
    filter.rank = { $in: ROLE_ORDER };
  } else if (
    rankSearch === "advisor" ||
    rankSearch === "lifeTime" ||
    rankSearch === "pastWay"
  ) {
    filter.rank = rankSearch;
  }
  else if(rankSearch === "primeryB"){
    filter.category = "B";
  }
  else if(rankSearch === "child"){
    console.log("child")
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
    const startDateString = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const endDateString = `${endDate.getFullYear()}-${String(
      endDate.getMonth() + 1
    ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    // Filter for actors whose `dob` is between startDateString and endDateString
    filter.dob = { $gte: startDateString, $lt: endDateString };
  } else if (rankRoleSearch === "specificDob") {
    // Filter for a specific dob
    const specificDob = "1959-12-05"; // The specific dob to filter
    filter.dob = specificDob; // Match the exact dob string
  }

  

  /* ---------------- DATA QUERY ---------------- */
  let actor: any[] = [];

  // 🔥 EXECUTIVE → CUSTOM ROLE ORDER
  if (rankSearch === "executive") {
    actor = await Actor.aggregate([
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
  } else {
    // normal sorting
    actor = await Actor.find(filter)
      .sort({ [sortBy]: sortWith })
      .skip(skip)
      .limit(limit);
  }

  /* ---------------- COUNTS ---------------- */
  const [totalActor, categoryACount, categoryBCount] = await Promise.all([
    Actor.countDocuments(),
    Actor.countDocuments({ category: "A" }),
    Actor.countDocuments({ category: "B" }),
  ]);

  const totalPage = Math.ceil(
    (category === "A"
      ? categoryACount
      : category === "B"
      ? categoryBCount
      : totalActor) / limit
  );

  /* ---------------- RESPONSE ---------------- */
  return {
    actor,
    totalActor,
    categoryACount,
    categoryBCount,
    totalPage,
  };
};

const filterByRank = async (rank: string) => {
  if (!rank) {
    throw new Error("No rank provided");
  }
  const actor = await Actor.find({ rank: rank });
  if (actor.length === 0) {
    throw new Error("Actor not found");
  }
  return actor;
};

export const ActorService = {
  createActor,
  getSingleActor,
  getAllActor,
  filterByRank,
};
