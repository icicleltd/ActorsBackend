import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { YoutubeService } from "./youtube.services";

/* ------------------------------------
   CREATE BANNER (Admin)
   image + title + subtitle
------------------------------------- */
const createYoutbe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, url } = req.body;
    console.log(req.body);
    const result = await YoutubeService.createYoutbe({
      title,
      url,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Youtube created successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET ALL BANNERS (Frontend/Admin)
------------------------------------- */
const getYoutube = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sortBy = (req.query?.sortBy as string) || "order";
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;

    const result = await YoutubeService.getYoutube(sortBy, sortWith);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Banners fetched successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE SINGLE BANNER (Admin)
------------------------------------- */
const deleteYoutube = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await YoutubeService.deleteYoutube(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Banner deleted successfully",
      data: result,
    });
  }
);

export const YoutubeController = {
  createYoutbe,
  getYoutube,
  deleteYoutube,
};
