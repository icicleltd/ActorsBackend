import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import { ActorService } from "./actor.services";
import catchAsync from "../shared/catchAsync";
import type { SortOrder } from "mongoose";

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
  }
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
  }
);
const getAllActor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const search = req.query.search as string;

    const limit = parseInt(req.query?.limit as string) || 10;
    const page = parseInt(req.query?.page as string) || 1;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortWith: SortOrder = req.query.sortWith === "asc" ? 1 : -1 || -1;
    const rankSearch = req.query.rankSearch;
    console.log(rankSearch);
    const result = await ActorService.getAllActor(
      search,
      page,
      limit,
      skip,
      category,
      sortBy,
      sortWith,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All actor fetch successfully",
      data: result,
    });
  }
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
  }
);

export const ActorController = {
  createActor,
  getSingleActor,
  getAllActor,
  filterByRank,
};
