import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { EventService } from "./event.services";
import { CreateEventDto } from "./event.interface";

const createEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: CreateEventDto = req.body;
    console.log(payload);
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    console.log(files)
    // const adminId = req.user?.id;
    const result = await EventService.createEvent(payload, files);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Event created successfully",
      data: result,
    });
  }
);

const getEvents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await EventService.getEvents();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Events fetched successfully",
      data: result,
    });
  }
);

const getAdminEvents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.id;
    const result = await EventService.getAdminEvents(adminId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin events fetched successfully",
      data: result,
    });
  }
);

const readEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.id;
    const result = await EventService.readEvent(eventId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Event updated successfully",
      data: result,
    });
  }
);

export const EventController = {
  createEvent,
  getEvents,
  getAdminEvents,
  readEvent,
};
