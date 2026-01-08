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

    const file = req.file;

    const result = await AboutService.createAbout(payload, file);

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
    const result = await AboutService.getAbouts();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Abouts fetched successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
const deleteAbout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await AboutService.deleteAbout(payload);

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
    const payload = req.body;
    const result = await AboutService.updateAbout(payload);

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
  deleteAbout,
  updateAbout,
};
