import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { HelpDeskService } from "./onlineHelpDesk.services";

/* ------------------------------------
   CREATE TICKET
------------------------------------- */
const createTicket = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
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
   GET assign ticket
------------------------------------- */
const getAssignTickets = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const id = req.user?.data._id;
    const role = req.user?.data.role;
    const idNo = req.query.idNo as string;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const skip = (page - 1) * limit;
    const result = await HelpDeskService.getAssignTickets({
      id,
      idNo,
      limit,
      page,
      skip,
      role,
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assign Tickets fetched successfully",
      data: result,
    });
  },
);
/* ------------------------------------
   GET ALL TICKETS
------------------------------------- */
const getTickets = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const user = req.user?.data;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const idNo = req.query.idNo as string;
    const skip = (page - 1) * limit;
    const view = req.query.view as string
    const result = await HelpDeskService.getTickets({
      user,
      limit,
      page,
      skip,
      idNo,view
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tickets fetched successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   Assign TICKET
------------------------------------- */
const assignTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await HelpDeskService.assignTicket({ payload });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Ticket assign successfully",
      data: result,
    });
  },
);

// update
const reply = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { ticketId, message, file } = req.body;
    const actorId = req.user?.data._id;
    const role = req.user?.data.role;

    const result = await HelpDeskService.reply({
      actorId,
      ticketId,
      message,
      file,
      role
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "reply created successfully",
      data: result,
    });
  },
);

export const HelpDeskController = {
  createTicket,
  getTickets,
  assignTicket,
  getAssignTickets,
  reply,
};
