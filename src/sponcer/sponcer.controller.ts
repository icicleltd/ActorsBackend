import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { SponcerService } from "./sponcer.services";

/* ------------------------------------
   CREATE BANNER (Admin)
   image + title + subtitle
------------------------------------- */
const createSponcer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, url } = req.body;
    console.log(req.body);
    const result = await SponcerService.createSponcer({
      title,
      url,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Sponcer created successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET ALL BANNERS (Frontend/Admin)
------------------------------------- */
const getSponcer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sortBy = (req.query?.sortBy as string) || "order";
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;

    const result = await SponcerService.getSponcer(sortBy, sortWith);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Sponcer fetched successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE SINGLE BANNER (Admin)
------------------------------------- */
const deleteSponcer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await SponcerService.deleteSponcer(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Sponcer deleted successfully",
      data: result,
    });
  }
);

export const SponcerController = {
  createSponcer,
  getSponcer,
  deleteSponcer,
};
