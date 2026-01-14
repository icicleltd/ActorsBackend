import { fileUploader } from "../helper/fileUpload";
import Actor from "./actor.schema";
import { AppError } from "../middleware/error";
import { Admin } from "../admin/admin.schema";
import Notification from "../notification/notification.schema";
import type { PipelineStage, SortOrder } from "mongoose";

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

// const ROLE_ORDER = [
//   "president",
//   "vice_president",
//   "general_secretary",
//   "joint_secretary",
//   "organizing_secretary",
//   "finance_secretary",
//   "office_secretary",
//   "event_secretary",
//   "law_welfare_secretary",
//   "publicity_secretary",
//   "it_secretary",
//   "executive_member",
// ];
export const ROLE_ORDER = [
  "president",
  "vice_president",
  "general_secretary",
  "joint_secretary",
  "organizing_secretary",
  "finance_secretary",
  "office_secretary",
  "event_secretary",

  // newly added (snake_case)
  "law_secretary",
  "social_welfare_secretary",
  
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
  sortWith: 1 | -1,
  executiveRank: string,
  rankGroup: string,
  searchYearRange: string,
  advisorYearRange: string
) => {
  const pipeline: PipelineStage[] = [];

  // ==================== SEARCH FILTER ====================
  if (search) {
    const fields = [
      "fullName",
      "idNo",
      "presentAddress",
      "phoneNumber",
      "rank",
    ];
    pipeline.push({
      $match: {
        $or: fields.map((filed) => ({
          [filed]: { $regex: search.trim(), $options: "i" },
        })),
      },
    });
  }

  // ==================== ADD CURRENT RANK LOGIC ====================
  // if (rankGroup === "all") {
  //   pipeline.push({
  //     $addFields: {
  //       current: {
  //         $let: {
  //           vars: {
  //             // Boolean check: does lifetime exist?
  //             hasLifetime: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     { $isArray: "$rankHistory" },
  //                     { $gt: [{ $size: "$rankHistory" }, 0] },
  //                   ],
  //                 },
  //                 then: {
  //                   $gt: [
  //                     {
  //                       $size: {
  //                         $filter: {
  //                           input: "$rankHistory",
  //                           as: "r",
  //                           cond: { $eq: ["$$r.rank", "lifeTime"] },
  //                         },
  //                       },
  //                     },
  //                     0,
  //                   ],
  //                 },
  //                 else: false,
  //               },
  //             },

  //             // Find recent executive (start >= 2025 AND end >= 2025 or null)
  //             recentExecutive: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     { $isArray: "$rankHistory" },
  //                     { $gt: [{ $size: "$rankHistory" }, 0] },
  //                   ],
  //                 },
  //                 then: {
  //                   $arrayElemAt: [
  //                     {
  //                       $filter: {
  //                         input: "$rankHistory",
  //                         as: "r",
  //                         cond: {
  //                           $and: [
  //                             {
  //                               $in: [
  //                                 "$$r.rank",
  //                                 [
  //                                   "president",
  //                                   "vice_president",
  //                                   "general_secretary",
  //                                   "joint_secretary",
  //                                   "organizing_secretary",
  //                                   "finance_secretary",
  //                                   "office_secretary",
  //                                   "event_secretary",
  //                                   "law_welfare_secretary",
  //                                   "publicity_secretary",
  //                                   "it_secretary",
  //                                   "executive_member",
  //                                 ],
  //                               ],
  //                             },
  //                             { $gte: ["$$r.start", 2025] },
  //                             // end must be >= 2025, null, or 0 (for edge cases)
  //                             {
  //                               $or: [
  //                                 { $gte: ["$$r.end", 2025] },
  //                                 { $eq: ["$$r.end", null] },
  //                                 { $eq: ["$$r.end", 0] },
  //                               ],
  //                             },
  //                           ],
  //                         },
  //                       },
  //                     },
  //                     0,
  //                   ],
  //                 },
  //                 else: null,
  //               },
  //             },

  //             // Find recent advisor (start >= 2025 AND end >= 2025 or null)
  //             recentAdvisor: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     { $isArray: "$rankHistory" },
  //                     { $gt: [{ $size: "$rankHistory" }, 0] },
  //                   ],
  //                 },
  //                 then: {
  //                   $arrayElemAt: [
  //                     {
  //                       $filter: {
  //                         input: "$rankHistory",
  //                         as: "r",
  //                         cond: {
  //                           $and: [
  //                             { $eq: ["$$r.rank", "advisor"] },
  //                             { $gte: ["$$r.start", 2025] },
  //                             // end must be >= 2025, null, or 0
  //                             {
  //                               $or: [
  //                                 { $gte: ["$$r.end", 2025] },
  //                                 { $eq: ["$$r.end", null] },
  //                                 { $eq: ["$$r.end", 0] },
  //                               ],
  //                             },
  //                           ],
  //                         },
  //                       },
  //                     },
  //                     0,
  //                   ],
  //                 },
  //                 else: null,
  //               },
  //             },

  //             // Find old advisor (end < 2025 AND end > 0)
  //             oldAdvisor: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     { $isArray: "$rankHistory" },
  //                     { $gt: [{ $size: "$rankHistory" }, 0] },
  //                   ],
  //                 },
  //                 then: {
  //                   $arrayElemAt: [
  //                     {
  //                       $filter: {
  //                         input: "$rankHistory",
  //                         as: "r",
  //                         cond: {
  //                           $and: [
  //                             { $eq: ["$$r.rank", "advisor"] },
  //                             { $lt: ["$$r.end", 2025] },
  //                             { $gt: ["$$r.end", 0] }, // Exclude 0 (which is used for lifetime)
  //                           ],
  //                         },
  //                       },
  //                     },
  //                     0,
  //                   ],
  //                 },
  //                 else: null,
  //               },
  //             },

  //             // Find pastWay rank
  //             pastWayRank: {
  //               $cond: {
  //                 if: {
  //                   $and: [
  //                     { $isArray: "$rankHistory" },
  //                     { $gt: [{ $size: "$rankHistory" }, 0] },
  //                   ],
  //                 },
  //                 then: {
  //                   $arrayElemAt: [
  //                     {
  //                       $filter: {
  //                         input: "$rankHistory",
  //                         as: "r",
  //                         cond: { $eq: ["$$r.rank", "pastWay"] },
  //                       },
  //                     },
  //                     0,
  //                   ],
  //                 },
  //                 else: null,
  //               },
  //             },
  //           },
  //           in: {
  //             $cond: {
  //               // Priority 1: Lifetime + Recent Executive
  //               if: {
  //                 $and: [
  //                   { $eq: ["$$hasLifetime", true] },
  //                   { $ne: ["$$recentExecutive", null] },
  //                 ],
  //               },
  //               then: {
  //                 primaryRank: "$$recentExecutive.rank",
  //                 secondaryRank: "Lifetime Member",
  //                 yearRange: "$$recentExecutive.yearRange",
  //                 start: "$$recentExecutive.start",
  //                 end: "$$recentExecutive.end",
  //               },
  //               else: {
  //                 $cond: {
  //                   // Priority 2: Lifetime + Recent Advisor
  //                   if: {
  //                     $and: [
  //                       { $eq: ["$$hasLifetime", true] },
  //                       { $ne: ["$$recentAdvisor", null] },
  //                     ],
  //                   },
  //                   then: {
  //                     primaryRank: "Advisor",
  //                     secondaryRank: "Lifetime Member",
  //                     yearRange: "$$recentAdvisor.yearRange",
  //                     start: "$$recentAdvisor.start",
  //                     end: "$$recentAdvisor.end",
  //                   },
  //                   else: {
  //                     $cond: {
  //                       // Priority 3: Lifetime + Old Advisor
  //                       if: {
  //                         $and: [
  //                           { $eq: ["$$hasLifetime", true] },
  //                           { $ne: ["$$oldAdvisor", null] },
  //                         ],
  //                       },
  //                       then: {
  //                         primaryRank: "Ex Advisor",
  //                         secondaryRank: "Lifetime Member",
  //                         yearRange: "$$oldAdvisor.yearRange",
  //                         start: "$$oldAdvisor.start",
  //                         end: "$$oldAdvisor.end",
  //                       },
  //                       else: {
  //                         $cond: {
  //                           // Priority 4: Lifetime Only
  //                           if: { $eq: ["$$hasLifetime", true] },
  //                           then: {
  //                             primaryRank: "Lifetime Member",
  //                             secondaryRank: null,
  //                             yearRange: null,
  //                             start: null,
  //                             end: null,
  //                           },
  //                           else: {
  //                             $cond: {
  //                               // Priority 5: Recent Executive (no lifetime)
  //                               if: { $ne: ["$$recentExecutive", null] },
  //                               then: {
  //                                 primaryRank: "$$recentExecutive.rank",
  //                                 secondaryRank: null,
  //                                 yearRange: "$$recentExecutive.yearRange",
  //                                 start: "$$recentExecutive.start",
  //                                 end: "$$recentExecutive.end",
  //                               },
  //                               else: {
  //                                 $cond: {
  //                                   // Priority 6: Recent Advisor (no lifetime)
  //                                   if: { $ne: ["$$recentAdvisor", null] },
  //                                   then: {
  //                                     primaryRank: "Advisor",
  //                                     secondaryRank: null,
  //                                     yearRange: "$$recentAdvisor.yearRange",
  //                                     start: "$$recentAdvisor.start",
  //                                     end: "$$recentAdvisor.end",
  //                                   },
  //                                   else: {
  //                                     $cond: {
  //                                       // Priority 7: Old Advisor (no lifetime)
  //                                       if: { $ne: ["$$oldAdvisor", null] },
  //                                       then: {
  //                                         primaryRank: "Ex Advisor",
  //                                         secondaryRank: null,
  //                                         yearRange: "$$oldAdvisor.yearRange",
  //                                         start: "$$oldAdvisor.start",
  //                                         end: "$$oldAdvisor.end",
  //                                       },
  //                                       else: {
  //                                         $cond: {
  //                                           // Priority 8: PastWay
  //                                           if: { $ne: ["$$pastWayRank", null] },
  //                                           then: {
  //                                             primaryRank: "Past Way",
  //                                             secondaryRank: null,
  //                                             yearRange: null,
  //                                             start: null,
  //                                             end: null,
  //                                           },
  //                                           else: {
  //                                             // Priority 9: Category-based
  //                                             $switch: {
  //                                               branches: [
  //                                                 {
  //                                                   case: { $eq: ["$category", "A"] },
  //                                                   then: {
  //                                                     primaryRank: "Member",
  //                                                     secondaryRank: null,
  //                                                     yearRange: null,
  //                                                     start: null,
  //                                                     end: null,
  //                                                   },
  //                                                 },
  //                                                 {
  //                                                   case: { $eq: ["$category", "B"] },
  //                                                   then: {
  //                                                     primaryRank: "Primary Member",
  //                                                     secondaryRank: null,
  //                                                     yearRange: null,
  //                                                     start: null,
  //                                                     end: null,
  //                                                   },
  //                                                 },
  //                                                 {
  //                                                   case: { $eq: ["$category", "C"] },
  //                                                   then: {
  //                                                     primaryRank: "Child Member",
  //                                                     secondaryRank: null,
  //                                                     yearRange: null,
  //                                                     start: null,
  //                                                     end: null,
  //                                                   },
  //                                                 },
  //                                               ],
  //                                               default: {
  //                                                 primaryRank: null,
  //                                                 secondaryRank: null,
  //                                                 yearRange: null,
  //                                                 start: null,
  //                                                 end: null,
  //                                               },
  //                                             },
  //                                           },
  //                                         },
  //                                       },
  //                                     },
  //                                   },
  //                                 },
  //                               },
  //                             },
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  if (rankGroup === "all") {
    /* ---------------------------------------
     1️⃣ Ensure rankHistory is array
  --------------------------------------- */
    pipeline.push({
      $addFields: {
        rankHistory: { $ifNull: ["$rankHistory", []] },
      },
    });

    /* ---------------------------------------
     2️⃣ Detect lifeTime
  --------------------------------------- */
    pipeline.push({
      $addFields: {
        hasLifeTime: {
          $in: ["lifeTime", "$rankHistory.rank"],
        },
      },
    });

    /* ---------------------------------------
     3️⃣ Compute latestRank
     (highest end → highest start)
     ignore lifeTime
  --------------------------------------- */
    // pipeline.push({
    //   $addFields: {
    //     latestRank: {
    //       $first: {
    //         $sortArray: {
    //           input: {
    //             $filter: {
    //               input: "$rankHistory",
    //               as: "r",
    //               cond: { $eq: ["$$r.start", 2025] }
    //             }
    //           },
    //           // sortBy: { end: -1, start: -1 }
    //         }
    //       }
    //     }
    //   }
    // });

    pipeline.push({
      $addFields: {
        latestRank: {
          $first: {
            $filter: {
              input: "$rankHistory",
              as: "r",
              cond: {
                $and: [
                  { $eq: ["$$r.start", 2025] },
                  { $ne: ["$$r.rank", "lifeTime"] },
                ],
              },
            },
          },
        },
      },
    });

    /* ---------------------------------------
     4️⃣ Build current field
  --------------------------------------- */
    pipeline.push({
      $addFields: {
        current: {
          $switch: {
            branches: [
              /* ✅ Latest Executive (real role name) */
              {
                case: { $in: ["$latestRank.rank", ROLE_ORDER] },
                then: {
                  primary: "$latestRank.rank",
                  secondary: {
                    $cond: ["$hasLifeTime", "lifeTime", "$$REMOVE"],
                  },
                },
              },

              /* ✅ Latest Advisor */
              {
                case: { $eq: ["$latestRank.rank", "advisor"] },
                then: {
                  primary: "advisor",
                  secondary: {
                    $cond: ["$hasLifeTime", "lifeTime", "$$REMOVE"],
                  },
                },
              },

              /* ✅ Old Advisor → ex_advisor */
              {
                case: {
                  $and: [
                    { $ne: ["$latestRank.rank", "advisor"] },
                    { $in: ["advisor", "$rankHistory.rank"] },
                  ],
                },
                then: {
                  primary: "Ex Advisor",
                  secondary: {
                    $cond: ["$hasLifeTime", "lifeTime", "$$REMOVE"],
                  },
                },
              },

              /* ✅ Only lifeTime */
              {
                case: "$hasLifeTime",
                then: { primary: "lifeTime" },
              },
            ],

            /* ⬇️ fallback by category */
            default: {
              primary: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$category", "A"] }, then: "Member" },
                    {
                      case: { $eq: ["$category", "B"] },
                      then: "Primary Member",
                    },
                    { case: { $eq: ["$category", "C"] }, then: "Child Member" },
                  ],
                  default: "Member",
                },
              },
            },
          },
        },
      },
    });

    /* ---------------------------------------
     5️⃣ Cleanup temp fields
  --------------------------------------- */
    pipeline.push({
      $project: {
        latestRank: 0,
        hasLifeTime: 0,
      },
    });
  }

 

  // ==================== CATEGORY FILTERS ====================
  if (category) {
    pipeline.push({
      $match: { category },
    });
  }

  if (rankGroup === "child") {
    pipeline.push({ $match: { category: "C" } });
  }

  if (rankGroup === "primeryB") {
    pipeline.push({ $match: { category: "B" } });
  }

  // ==================== RANK HISTORY FILTERS ====================
  const needsRankHistory =
    rankGroup === "executive" ||
    ["pastWay", "advisor", "lifeTime"].includes(rankGroup || "") ||
    executiveRank ||
    searchYearRange;

  if (needsRankHistory) {
    pipeline.push({ $unwind: "$rankHistory" });

    const rankFilter: any = {};

    if (rankGroup === "executive") {
      rankFilter["rankHistory.rank"] = { $in: ROLE_ORDER };
    }

    if (executiveRank) {
      rankFilter["rankHistory.rank"] = executiveRank;
    }

    if (["pastWay", "advisor", "lifeTime"].includes(rankGroup || "")) {
      rankFilter["rankHistory.rank"] = rankGroup;
    }

    if (searchYearRange) {
      const [startYear, endYear] = searchYearRange.split("-").map(Number);
      rankFilter["rankHistory.start"] = startYear;
      rankFilter["rankHistory.end"] = endYear;
    }

    if (advisorYearRange) {
      const [startYear, endYear] = advisorYearRange.split("-").map(Number);
      rankFilter["rankHistory.start"] = startYear;
      rankFilter["rankHistory.end"] = endYear;
    }

    pipeline.push({ $match: rankFilter });
  }

  // ==================== SORTING ====================
  if (rankGroup === "executive") {
    pipeline.push({
      $addFields: {
        roleOrder: {
          $indexOfArray: [ROLE_ORDER, "$rankHistory.rank"],
        },
      },
    });
    pipeline.push({ $sort: { "rankHistory.end": -1, roleOrder: 1 } });
  } else if (rankGroup === "advisor") {
    console.log("in advisor if");
    pipeline.push({
      $sort: { "rankHistory.end": -1, idNo: 1 },
    });
  } else {
    pipeline.push({ $sort: { [sortBy]: sortWith } });
  }

  // ==================== PAGINATION WITH FACET ====================
  pipeline.push({
    $facet: {
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          // ✅ FIX: Explicitly project all fields including current
          $project: {
            password: 0, // Exclude password only
            // All other fields including current will be included by default
          },
        },
      ],
      filteredTotal: [{ $count: "count" }],
    },
  });

  // ==================== CATEGORY COUNTS ====================
  const reportActor = await Actor.aggregate([
    {
      $group: {
        _id: null,
        totalActor: { $sum: 1 },
        categoryACount: {
          $sum: { $cond: [{ $eq: ["$category", "A"] }, 1, 0] },
        },
        categoryBCount: {
          $sum: { $cond: [{ $eq: ["$category", "B"] }, 1, 0] },
        },
        categoryCCount: {
          $sum: { $cond: [{ $eq: ["$category", "C"] }, 1, 0] },
        },
      },
    },
  ]);

  // ==================== EXECUTE PIPELINE ====================
  const result = await Actor.aggregate(pipeline);
  // console.log(reportActor);
  const aggregationResult = result[0] || {};

  return {
    actor: aggregationResult.data || [],
    totalActor: reportActor[0]?.totalActor || 0,
    categoryBCount: reportActor[0]?.categoryBCount || 0,
    categoryCCount: reportActor[0]?.categoryCCount || 0,
    categoryACount: reportActor[0]?.categoryACount || 0,
    totalPage: Math.ceil(
      (aggregationResult.filteredTotal?.[0]?.count || 0) / limit
    ),
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
  console.log(payload,files)
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
  console.log(newActor)
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
