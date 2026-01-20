import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { GalleryService } from "./galary.services";

/* ------------------------------------
   UPLOAD GALLERY IMAGES (Admin)
------------------------------------- */
const createGalleryImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const result = await GalleryService.createGalleryImages(files);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Gallery images uploaded successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET GALLERY IMAGES (Frontend/Admin)
------------------------------------- */
const getGalleryImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 20;
    const skip = (page - 1) * limit;
    const sortBy = (req.query?.sortBy as string) || "createdAt";
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;

    const result = await GalleryService.getGalleryImages(
      skip,
      limit,
      sortBy,
      sortWith
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Gallery images fetched successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE SINGLE GALLERY IMAGE (Admin)
------------------------------------- */
const deleteGalleryImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await GalleryService.deleteGalleryImage(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Gallery image deleted successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE ALL GALLERY IMAGES (Admin)
------------------------------------- */
const deleteAllGalleryImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await GalleryService.deleteAllGalleryImages();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All gallery images deleted successfully",
      data: result,
    });
  }
);

export const GalleryController = {
  createGalleryImages,
  getGalleryImages,
  deleteGalleryImage,
  deleteAllGalleryImages,
};
