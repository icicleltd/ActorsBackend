import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { SponsorService } from "./sponcer.services";

/* ------------------------------------
   CREATE BANNER (Admin)
   image + title + subtitle
------------------------------------- */
const createSponcer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    console.log(payload)
    const result = await SponsorService.createSponcer(payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Sponsor created successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   GET ALL BANNERS (Frontend/Admin)
------------------------------------- */
const getSponcer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sortBy = (req.query?.sortBy as string) || "order";
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;

    const result = await SponsorService.getSponcer(sortBy, sortWith);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Sponsor fetched successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   DELETE SINGLE BANNER (Admin)
------------------------------------- */
const deleteSponcer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await SponsorService.deleteSponcer(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Sponsor deleted successfully",
      data: result,
    });
  },
);
const editSponsor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await SponsorService.editSponsor(id, payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Sponsor updated successfully",
      data: result,
    });
  },
);

export const SponcerController = {
  createSponcer,
  getSponcer,
  deleteSponcer,
  editSponsor,
};
