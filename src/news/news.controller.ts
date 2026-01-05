import { Request, Response } from "express";
import catchAsync from "../shared/catchAsync";
import sendResponse from "../shared/sendResponse";
import { CreateNewsDto } from "./news.interface";
import { NewsService } from "./news.services";

const createNews = catchAsync(async (req: Request, res: Response) => {
  const payload: CreateNewsDto = req.body;
  const file = req.file;

  const result = await NewsService.createNews(payload, file);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "News created successfully",
    data: result,
  });
});

const getAllNews = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const skip = (page - 1) * limit;
  const sortWith = (req.query.sortWith as string) === "asc" ? 1 : -1;
  const result = await NewsService.getAllNews(
    limit,
    page,
    sortBy,
    sortWith,
    skip
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "News fetched successfully",
    data: result,
  });
});

const getSingleNews = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await NewsService.getSingleNews(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "News fetched successfully",
    data: result,
  });
});

const deleteNews = catchAsync(async (req, res) => {
  const result = await NewsService.deleteNews(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "News deleted successfully",
    data: result,
  });
});

export const NewsController = {
  createNews,
  getAllNews,
  getSingleNews,
  deleteNews,
};
