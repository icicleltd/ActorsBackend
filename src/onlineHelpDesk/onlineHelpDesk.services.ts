import mongoose from "mongoose";
import { AppError } from "../middleware/error";
import { HelpDesk } from "./onlineHelpDesk.schema";
import { Notification } from "../notification/notification.schema";
import { Types } from "mongoose";
import { IAssignTicketPayload, ROLE_ORDER } from "./onlineHelpDesk.interface";
import Actor from "../actor/actor.schema";

/* ------------------------------------
   CREATE TICKET
------------------------------------- */
const createTicket = async (
  actorId: string,
  payload: {
    ticketId: string;
    subject: string;
    message: string;
    file?: string;
  },
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { ticketId, subject, message, file } = payload;

    if (!ticketId || !subject || !message) {
      throw new AppError(400, "TicketId, subject and message are required");
    }

    /* -------------------------
       CREATE TICKET
    --------------------------*/
    const ticket = await HelpDesk.create(
      [
        {
          ticketId,
          subject,
          messages: [
            {
              sender: new Types.ObjectId(actorId),
              senderModel: "Actor",
              message,
            },
          ],
          file,
          createdBy: actorId,
        },
      ],
      { session },
    );

    const createdTicket = ticket[0];

    /* -------------------------
       CREATE NOTIFICATION
    --------------------------*/
    await Notification.create(
      [
        {
          recipientRole: ["admin", "superadmin"],

          type: "help_desk_ticket",

          title: "New Help Desk Ticket",

          message: `New ticket created: ${subject}`,

          // recipient: actorId, // optional if needed

          ticket: createdTicket._id,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return createdTicket;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/* ------------------------------------
   GET ALL TICKETS
------------------------------------- */
const getTickets = async ({
  user,
  limit,
  page,
  skip,
  idNo,
  view,
}: {
  user: any;
  limit: number;
  page: number;
  skip: number;
  idNo: string;
  view: string;
}) => {
  // if (!user?._id && !idNo) {
  //   throw new AppError(401, "Unauthorized");
  // }

  let matchStage: any = {};
  let actorId: string | null = null;

  // Member view
  if (view !== "admin") {
    const actor = await Actor.findOne({ idNo })
      .select("_id role")
      .lean();

    if (!actor) {
      throw new AppError(400, "Actor not found");
    }

    actorId = actor._id.toString();

    matchStage = {
      createdBy: new Types.ObjectId(actorId),
    };
  }

  const tickets = await HelpDesk.aggregate([
    {
      $match: matchStage,
    },

    // collect all user ids used in ticket
    {
      $addFields: {
        userIds: {
          $setUnion: [
            ["$createdBy"],
            "$messages.sender",
            "$targetActorIds.actorId",
          ],
        },
      },
    },

    // lookup actors
    {
      $lookup: {
        from: "actors",
        localField: "userIds",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              fullName: 1,
              idNo: 1,
              photo: 1,
            },
          },
        ],
        as: "actors",
      },
    },

    // lookup admins
    {
      $lookup: {
        from: "admins",
        localField: "userIds",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              fullName: 1,
              photo: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    // merge actors + admins
    {
      $addFields: {
        users: {
          $concatArrays: ["$actors", "$admins"],
        },
      },
    },

    // populate createdBy
    {
      $addFields: {
        createdBy: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$users",
                cond: {
                  $eq: ["$$this._id", "$createdBy"],
                },
              },
            },
            0,
          ],
        },
      },
    },

    // populate message sender
    {
      $addFields: {
        messages: {
          $map: {
            input: "$messages",
            as: "msg",
            in: {
              _id: "$$msg._id",
              message: "$$msg.message",
              createdAt: "$$msg.createdAt",
              senderModel: "$$msg.senderModel",
              sender: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$users",
                      cond: {
                        $eq: ["$$this._id", "$$msg.sender"],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    // populate target actors
    {
      $addFields: {
        targetActorIds: {
          $map: {
            input: "$targetActorIds",
            as: "target",
            in: {
              _id: "$$target._id",
              isMemberRead: "$$target.isMemberRead",
              actorId: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$users",
                      cond: {
                        $eq: ["$$this._id", "$$target.actorId"],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    {
      $sort: { createdAt: -1 },
    },

    {
      $project: {
        ticketId: 1,
        subject: 1,
        status: 1,
        priority: 1,
        createdBy: 1,
        createdAt: 1,
        messages: 1,
        targetActorIds: 1,
        firstMessage: {
          $arrayElemAt: ["$messages", 0],
        },
        latestMessage: {
          $arrayElemAt: ["$messages", -1],
        },
      },
    },

    {
      $skip: skip,
    },

    {
      $limit: limit,
    },
  ]);

  // total count
  let total;

  if (view !== "admin" && actorId) {
    total = await HelpDesk.countDocuments({
      createdBy: new Types.ObjectId(actorId),
    });
  } else {
    total = await HelpDesk.countDocuments();
  }

  const totalPages = Math.ceil(total / limit);

  return {
    tickets,
    total,
    totalPages,
    currentPage: page,
  };
};

const getAssignTickets = async ({
  idNo,
  limit,
  page,
  skip,
  id,
  role,
}: {
  idNo: string;
  limit: number;
  page: number;
  skip: number;
  id: string;
  role: string;
}) => {
  // if (!id && !idNo) {
  //   throw new AppError(401, "Unauthorized");
  // }
  let actorId: string;
  if (role === "member") {
    actorId = id;
  } else {
    const actor = await Actor.findOne({
      idNo: idNo,
    })
      .select("_id")
      .lean();
    if (!actor) {
      throw new AppError(400, "Actor not found");
    }
    actorId = actor._id.toString();
  }

  const tickets = await HelpDesk.aggregate([
    {
      $match: {
        "targetActorIds.actorId": { $in: [new Types.ObjectId(actorId)] },
      },
    },

    // collect all actor ids used in the ticket
    {
      $addFields: {
        actorIds: {
          $setUnion: [
            ["$createdBy"],
            "$messages.sender",
            "$targetActorIds.actorId",
          ],
        },
      },
    },

    // lookup actors once
    {
      $lookup: {
        from: role === "member" ? "actors" : "admins",
        localField: "actorIds",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              fullName: 1,
              idNo: 1,
              photo: 1,
            },
          },
        ],
        as: "actors",
      },
    },

    // map createdBy
    {
      $addFields: {
        createdBy: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$actors",
                cond: { $eq: ["$$this._id", "$createdBy"] },
              },
            },
            0,
          ],
        },
      },
    },

    // map message sender
    {
      $addFields: {
        messages: {
          $map: {
            input: "$messages",
            as: "msg",
            in: {
              _id: "$$msg._id",
              message: "$$msg.message",
              createdAt: "$$msg.createdAt",
              senderModel: "$$msg.senderModel",
              sender: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$actors",
                      cond: { $eq: ["$$this._id", "$$msg.sender"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    // map target actors
    {
      $addFields: {
        targetActorIds: {
          $map: {
            input: "$targetActorIds",
            as: "target",
            in: {
              _id: "$$target._id",
              isMemberRead: "$$target.isMemberRead",
              actorId: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$actors",
                      cond: { $eq: ["$$this._id", "$$target.actorId"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    {
      $sort: { createdAt: -1 },
    },

    {
      $project: {
        ticketId: 1,
        subject: 1,
        status: 1,
        priority: 1,
        createdBy: 1,
        createdAt: 1,
        messages: 1,
        targetActorIds: 1,
        firstMessage: { $arrayElemAt: ["$messages", 0] },
        latestMessage: { $arrayElemAt: ["$messages", -1] },
      },
    },

    { $skip: skip },
    { $limit: limit },
  ]);

  // const tickets = await HelpDesk.aggregate([
  //   {
  //     $match: {
  //       "targetActorIds.actorId": { $in: [new Types.ObjectId(actorId)] },
  //     },
  //   },
  //   {
  //     $project: {
  //       ticketId: 1,
  //       subject: 1,
  //       status: 1,
  //       priority: 1,
  //       createdBy: 1,
  //       createdAt: 1,
  //       messages: 1,
  //       firstMessage: {
  //         $arrayElemAt: ["$messages", 0],
  //       },
  //       latestMessage: { $arrayElemAt: ["$messages", -1] },
  //     },
  //   },
  //   { $skip: skip },
  //   { $sort: { createdAt: -1 } },
  //   { $limit: limit },
  // ]);

  const total = await HelpDesk.countDocuments({
    "targetActorIds.actorId": { $in: [actorId] },
  });
  const replyAccess = true;
  const totalPages = Math.floor(total / limit);
  return { tickets, total, totalPages, currentPage: page, replyAccess };
};

/* ------------------------------------
   assignTicket TICKET
------------------------------------- */
const assignTicket = async ({ payload }: { payload: IAssignTicketPayload }) => {
  const { ticketId, actor, executiveYear, advisorYear } = payload;

  if (!ticketId) {
    throw new AppError(400, "TicketId is required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  let includesExecutive: boolean = executiveYear.length > 0;
  let includesAdvisor: boolean = advisorYear.length > 0;

  try {
    const actorIds = actor?.map((a) => a._id) || [];

    // Parallel queries
    const [executives, advisors] = await Promise.all([
      executiveYear.length > 0
        ? Actor.find({
            "rankHistory.rank": { $in: ROLE_ORDER },
            "rankHistory.yearRange": { $in: executiveYear },
          })
            .select("_id")
            .lean()
        : [],

      advisorYear.length > 0
        ? Actor.find({
            "rankHistory.rank": "advisor",
            "rankHistory.yearRange": { $in: advisorYear },
          })
            .select("_id")
            .lean()
        : [],
    ]);
    const executiveIds = executives.map((e) => e._id.toString());
    const advisorIds = advisors.map((a) => a._id.toString());

    // Combine all ids (remove duplicates)
    const targetActorIds = [
      ...new Set([...actorIds, ...executiveIds, ...advisorIds]),
    ];
    const actorObjects = targetActorIds.map((id) => ({
      actorId: id,
      isMemberRead: false,
    }));

    // Update HelpDesk ticket
    const res = await HelpDesk.findByIdAndUpdate(
      ticketId,
      {
        $addToSet: {
          targetActorIds: { $each: actorObjects },
        },
        $set: {
          targetRole:
            includesExecutive && includesAdvisor
              ? "all"
              : includesExecutive
                ? "executive_member"
                : includesAdvisor
                  ? "advisor_member"
                  : "actor",
          status: "pending",
        },
      },
      { session, new: true }, // return updated document
    );

    // check if no actors were assigned
    if (!res || !res.targetActorIds || res.targetActorIds.length === 0) {
      throw new AppError(400, "Ticket assignment failed. No actors assigned.");
    }
    // Build notification list
    const notifications: any[] = [];

    // actor notifications
    actorIds.forEach((id) => {
      notifications.push({
        recipientRole: "member",
        recipient: id,
        ticket: ticketId,
        type: "assign_help_desk_ticket",
        title: "Help Desk Ticket Assigned",
        message: "A ticket has been assigned to you.",
      });
    });

    // executive notifications
    executives.forEach((exe) => {
      notifications.push({
        recipientRole: "member",
        recipient: exe._id,
        ticket: ticketId,
        type: "assign_help_desk_ticket",
        title: "Help Desk Ticket Review",
        message: "A ticket requires executive attention.",
      });
    });

    // advisor notifications
    advisors.forEach((adv) => {
      notifications.push({
        recipientRole: "member",
        recipient: adv._id,
        ticket: ticketId,
        type: "assign_help_desk_ticket",
        title: "Help Desk Ticket Consultation",
        message: "A ticket requires advisor consultation.",
      });
    });

    // Bulk insert notifications
    if (notifications.length) {
      await Notification.insertMany(notifications, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Ticket assigned successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// update section

const reply = async ({
  ticketId,
  actorId,
  message,
  file,
  role,
}: {
  ticketId: string;
  actorId: string;
  message: string;
  file?: string;
  role: string;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await HelpDesk.findById(ticketId).session(session);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const updatedTicket = await HelpDesk.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          messages: {
            sender: new Types.ObjectId(actorId),
            senderModel: role === "member" ? "Actor" : "Admin",
            message,
            ...(file && { file }),
          },
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    await Notification.create(
      [
        {
          recipientRole: ["member"],
          recipient: ticket.createdBy,
          title: "New Reply on Your Help Desk Ticket",
          message:
            "Your support ticket has received a new reply. Please check the conversation.",
          ticket: ticket._id,
          type: "reply_help_desk_ticket",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return updatedTicket;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const HelpDeskService = {
  createTicket,
  getTickets,
  assignTicket,
  getAssignTickets,
  reply,
};
