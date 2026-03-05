"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpDeskService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = require("../middleware/error");
const onlineHelpDesk_schema_1 = require("./onlineHelpDesk.schema");
const notification_schema_1 = require("../notification/notification.schema");
const mongoose_2 = require("mongoose");
/* ------------------------------------
   CREATE TICKET
------------------------------------- */
const createTicket = async (actorId, payload) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const { ticketId, subject, message, file } = payload;
        if (!ticketId || !subject || !message) {
            throw new error_1.AppError(400, "TicketId, subject and message are required");
        }
        /* -------------------------
           CREATE TICKET
        --------------------------*/
        const ticket = await onlineHelpDesk_schema_1.HelpDesk.create([
            {
                ticketId,
                subject,
                message,
                file,
                createdBy: actorId,
            },
        ], { session });
        const createdTicket = ticket[0];
        /* -------------------------
           CREATE NOTIFICATION
        --------------------------*/
        await notification_schema_1.Notification.create([
            {
                recipientRole: ["admin", "superadmin"],
                type: "help_desk_ticket",
                title: "New Help Desk Ticket",
                message: `New ticket created: ${subject}`,
                // recipient: actorId, // optional if needed
                ticket: createdTicket._id,
            },
        ], { session });
        await session.commitTransaction();
        session.endSession();
        return createdTicket;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
/* ------------------------------------
   GET ALL TICKETS
------------------------------------- */
const getTickets = async ({ user, limit, page, skip, }) => {
    if (!user) {
        throw new error_1.AppError(401, "Unauthorized");
    }
    if (user.role === "admin" || user.role === "superadmin") {
        const tickets = await onlineHelpDesk_schema_1.HelpDesk.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit).lean();
        const total = await onlineHelpDesk_schema_1.HelpDesk.countDocuments();
        const totalPages = Math.ceil(total / limit);
        return { tickets, total, totalPages, currentPage: page };
    }
    const userId = user._id;
    console.log("userid", userId);
    const tickets = await onlineHelpDesk_schema_1.HelpDesk.find({
        createdBy: new mongoose_2.Types.ObjectId(userId),
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit).lean();
    const total = await onlineHelpDesk_schema_1.HelpDesk.countDocuments();
    const totalPages = Math.ceil(total / limit);
    return { tickets, total, totalPages, currentPage: page };
};
/* ------------------------------------
   GET SINGLE TICKET
------------------------------------- */
const getSingleTicket = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Ticket id is required");
    }
    const ticket = await onlineHelpDesk_schema_1.HelpDesk.findById(id);
    if (!ticket) {
        throw new error_1.AppError(404, "Ticket not found");
    }
    return ticket;
};
/* ------------------------------------
   DELETE SINGLE TICKET
------------------------------------- */
const deleteTicket = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Ticket id is required");
    }
    const ticket = await onlineHelpDesk_schema_1.HelpDesk.findById(id);
    if (!ticket) {
        throw new error_1.AppError(404, "Ticket not found");
    }
    await onlineHelpDesk_schema_1.HelpDesk.findByIdAndDelete(id);
    return ticket;
};
/* ------------------------------------
   DELETE ALL TICKETS
------------------------------------- */
const deleteAllTickets = async () => {
    const result = await onlineHelpDesk_schema_1.HelpDesk.deleteMany({});
    return result;
};
exports.HelpDeskService = {
    createTicket,
    getTickets,
    getSingleTicket,
    deleteTicket,
    deleteAllTickets,
};
