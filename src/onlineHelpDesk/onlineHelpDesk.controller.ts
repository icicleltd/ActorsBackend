import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { HelpDeskService } from "./onlineHelpDesk.services";

/* ------------------------------------
   CREATE TICKET
------------------------------------- */
const createTicket = catchAsync(
  async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    const { ticketId, subject, message, file } = req.body;
    const actorId = req.user?.data._id;

    const result = await HelpDeskService.createTicket(actorId, {
      ticketId,
      subject,
      message,
      file,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Ticket created successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   GET ALL TICKETS
------------------------------------- */
const getTickets = catchAsync(
  async (req: Request & {user?:any}, res: Response, next: NextFunction) => {
    const user = req.user?.data;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const skip = (page - 1) * limit;
    const result = await HelpDeskService.getTickets({ user, limit, page, skip });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tickets fetched successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   GET SINGLE TICKET
------------------------------------- */
const getSingleTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await HelpDeskService.getSingleTicket(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Ticket fetched successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   DELETE SINGLE TICKET
------------------------------------- */
const deleteTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await HelpDeskService.deleteTicket(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Ticket deleted successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   DELETE ALL TICKETS
------------------------------------- */
const deleteAllTickets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await HelpDeskService.deleteAllTickets();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All tickets deleted successfully",
      data: result,
    });
  },
);

export const HelpDeskController = {
  createTicket,
  getTickets,
  getSingleTicket,
  deleteTicket,
  deleteAllTickets,
};
