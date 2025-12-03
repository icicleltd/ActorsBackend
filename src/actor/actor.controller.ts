import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import { ActorService } from "./actor.services";
import catchAsync from "../shared/catchAsync";

const createActor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const data = req.body;
    // console.log("Body =>", req.body);
    // console.log("Files =>", files);

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
    const result = await ActorService.getAllActor();
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
    console.log("rank",rank)
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
