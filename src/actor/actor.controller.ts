import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import { ActorService } from "./actor.services";
import catchAsync from "../shared/catchAsync";
import type { SortOrder } from "mongoose";
import { AppError } from "../middleware/error";

const createActor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const data = req.body;
    const result = await ActorService.createActor(files, data);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Actors retrieved successfully",
      data: result,
    });
  },
);

const getSingleActor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const actorId = req.params.id;
    const result = await ActorService.getSingleActor(actorId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Single actor fetch successfully",
      data: result,
    });
  },
);
const getAllActor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const search = req.query.search as string;

    const limit = parseInt(req.query?.limit as string) || 10;
    const page = parseInt(req.query?.page as string) || 1;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortWith: 1 | -1 = req.query.sortWith === "asc" ? 1 : -1;
    const executiveRank = req.query.executiveRank as string;
    const rankGroup = req.query.rankGroup as string;
    // Dynamically calculate the latest year range (e.g., 2025-2028)
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - (currentYear % 3); // Find the nearest previous multiple of 3 (e.g., 2025, 2022, etc.)
    const endYear = startYear + 3; // Add 3 years to get the end year
    const defaultYearRange = `${startYear}-${endYear}`;

    // Use the dynamic year range if searchYearRange is not provided
    const searchYearRange = req.query.searchYearRange as string;
    const advisorYearRange = req.query.advisorYearRange as string;
    const result = await ActorService.getAllActor(
      search,
      page,
      limit,
      skip,
      category,
      sortBy,
      sortWith,
      executiveRank,
      rankGroup,
      searchYearRange,
      advisorYearRange,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All actor fetch successfully",
      data: result,
    });
  },
);
const filterByRank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rank = req.params.rank;
    const result = await ActorService.filterByRank(rank);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Get data by rank successfully",
      data: result,
    });
  },
);

const updateActor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Uploaded files
    const payload = req.body;
    if (!id) {
      throw new AppError(400, "Actor ID is required");
    }
    const updatedActor = await ActorService.updateActor(payload, files, id);
    // if (!updatedActor) {
    //   throw new AppError(404, "Actor not found");
    // }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Actor updated successfully",
      data: updatedActor,
    });
  },
);
const getActorForModal = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id as string;
    const search = req.query.search as string;
    const alive = req.query.alive as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortWith: 1 | -1 = req.query.sortWith === "asc" ? 1 : -1;

    const result = await ActorService.getActorForModal(
      id,
      search,
      limit,
      sortBy,
      sortWith,
      alive,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Actor get successfully",
      data: result,
    });
  },
);
// const test = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     let a: any;
//     const b = "abc";
//     const result = await ActorService.updateActor(a, b);
//     sendResponse(res, {
//       statusCode: 201,
//       success: true,
//       message: "Actor Promoted successfully",
//       data: result,
//     });
//   }
// );

export const ActorController = {
  createActor,
  getSingleActor,
  getAllActor,
  filterByRank,
  updateActor,
  getActorForModal,
};
