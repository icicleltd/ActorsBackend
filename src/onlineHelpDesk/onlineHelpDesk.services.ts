import mongoose from "mongoose";
import { AppError } from "../middleware/error";
import { HelpDesk } from "./onlineHelpDesk.schema";
import { Notification } from "../notification/notification.schema";
import { Types } from "mongoose";

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
          message,
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
}: {
  user: any;
  limit: number;
  page: number;
  skip: number;
}) => {
  if (!user) {
    throw new AppError(401, "Unauthorized");
  }
  if (user.role === "admin" || user.role === "superadmin") {
    const tickets = await HelpDesk.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit).lean();
    const total = await HelpDesk.countDocuments();
    const totalPages = Math.ceil(total / limit);
    return { tickets, total, totalPages, currentPage: page };
  }
  const userId = user._id;
  console.log("userid", userId);
  const tickets = await HelpDesk.find({
    createdBy: new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit).lean();

  const total = await HelpDesk.countDocuments();
  const totalPages = Math.ceil(total / limit);
  return { tickets, total, totalPages, currentPage: page };
};

/* ------------------------------------
   GET SINGLE TICKET
------------------------------------- */
const getSingleTicket = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Ticket id is required");
  }

  const ticket = await HelpDesk.findById(id);

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  return ticket;
};

/* ------------------------------------
   DELETE SINGLE TICKET
------------------------------------- */
const deleteTicket = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Ticket id is required");
  }

  const ticket = await HelpDesk.findById(id);

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  await HelpDesk.findByIdAndDelete(id);

  return ticket;
};

/* ------------------------------------
   DELETE ALL TICKETS
------------------------------------- */
const deleteAllTickets = async () => {
  const result = await HelpDesk.deleteMany({});
  return result;
};

export const HelpDeskService = {
  createTicket,
  getTickets,
  getSingleTicket,
  deleteTicket,
  deleteAllTickets,
};
