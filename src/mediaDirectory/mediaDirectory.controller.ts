import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { MediaDirectoryService } from "./mediaDirectory.services";
import {
  CreateEventDto,
  ICreateMediaDirectory,
  MediaDirectoryType,
} from "./mediaDirectory.interface";
import { AppError } from "../middleware/error";

const createMediaDirectory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: ICreateMediaDirectory = req.body;
    // const adminId = req.user?.id;
    const result = await MediaDirectoryService.createMediaDirectory(payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "MediaDirectory created successfully",
      data: result,
    });
  }
);

const getMediaDirectory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mediaRole } = req.query;
    if (!mediaRole || typeof mediaRole !== "string") {
      throw new AppError(400, "mediaRole query is required"); 
    }
    const result = await MediaDirectoryService.getMediaDirectory(mediaRole as MediaDirectoryType);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "MediaDirectory fetched successfully",
      data: result,
    });
  }
);

// const getAdminEvents = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const adminId = req.params.id;
//     const result = await EventService.getAdminEvents(adminId);

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Admin events fetched successfully",
//       data: result,
//     });
//   }
// );

// const readEvent = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const eventId = req.params.id;
//     const result = await EventService.readEvent(eventId);

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Event updated successfully",
//       data: result,
//     });
//   }
// );

export const MediaDirectoryController = {
  createMediaDirectory,
  getMediaDirectory,
};
