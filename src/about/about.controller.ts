import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { AboutService } from "./about.services";

/* ------------------------------------
   CREATE ABOUT
------------------------------------ */
const createAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: any = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const result = await AboutService.createAbout(payload, files);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "About created successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET ABOUTS
------------------------------------ */
const getAbouts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventType = req.query.eventType;
    const sortBy = req.query.sortBy as string;
    const sortWith =
      req.query.sortWith === "asc"
        ? 1
        : req.query.sortWith === "desc"
        ? -1
        : -1;

    const payload: any = {};
    if (eventType === "PAST" || eventType === "UPCOMING") {
      payload.eventType = eventType;
    }

    const result = await AboutService.getAbouts(
      payload,
      sortBy,
      sortWith
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Abouts fetched successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET ADMIN ABOUTS
------------------------------------ */
const getAdminAbouts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.id;

    const result = await AboutService.getAbouts(adminId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin abouts fetched successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   READ ABOUT
------------------------------------ */
const readAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const aboutId = req.params.id;

    const result = await AboutService.getAbouts(aboutId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "About updated successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
const deleteAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const aboutId = req.params.id;

    const result = await AboutService.deleteAbout(aboutId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "About deleted successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   UPDATE ABOUT
------------------------------------ */
const updateAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const payload = req.body;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const result = await AboutService.updateAbout(id, payload, files);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "About updated successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   EXPORT
------------------------------------ */
export const AboutController = {
  createAbout,
  getAbouts,
  getAdminAbouts,
  readAbout,
  deleteAbout,
  updateAbout,
};
