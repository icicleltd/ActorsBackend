import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { BannerService } from "./banner.services";

/* ------------------------------------
   CREATE BANNER (Admin)
   image + title + subtitle
------------------------------------- */
const createBanner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const { title, subtitle } = req.body;

    const result = await BannerService.createBanner({
      file,
      title,
      subtitle,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Banner created successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET ALL BANNERS (Frontend/Admin)
------------------------------------- */
const getBanners = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sortBy = (req.query?.sortBy as string) || "order";
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;

    const result = await BannerService.getBanners(sortBy, sortWith);

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
const deleteBanner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await BannerService.deleteBanner(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Banner deleted successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE ALL BANNERS (Admin)
------------------------------------- */
const deleteAllBanners = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await BannerService.deleteAllBanners();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All banners deleted successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   REORDER BANNERS (Admin)
------------------------------------- */
const reorderBanners = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await BannerService.reorderBanners(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Banner order updated successfully",
      data: result,
    });
  }
);

export const BannerController = {
  createBanner,
  getBanners,
  deleteBanner,
  deleteAllBanners,
  reorderBanners,
};
