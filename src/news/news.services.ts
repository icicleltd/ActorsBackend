import { AppError } from "../middleware/error";
import { fileUploader } from "../helper/fileUpload";
import { News } from "./news.schema";
import { CreateNewsDto } from "./news.interface";
import { sanitizePayload } from "../helper/senitizePayload";
import { Types } from "mongoose";

const createNews = async (
  payload: CreateNewsDto,
  file?: Express.Multer.File
) => {
  if (!file) {
    throw new AppError(400, "Image is required");
  }

  const upload = (await fileUploader.CloudinaryUpload(file)) as {
    secure_url: string;
  };
  const news = await News.create({
    title: payload.title,
    image: upload.secure_url,
    published: payload.published,
    link: payload.link,
    details: payload.details,
    category: payload.category,
  });
  return news;
};

const getAllNews = async (
  limit: number,
  page: number,
  sortBy: string,
  sortWith: 1 | -1,
  skip: number
) => {
  // const news = await News.find()
  //   .sort({ [sortBy]: sortWith })
  //   .skip(skip)
  //   .limit(limit);
  // const total = await News.countDocuments();

  const [news, total] = await Promise.all([
    News.find()
      .sort({ [sortBy]: sortWith })
      .skip(skip)
      .limit(limit),
    News.countDocuments(),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { news, total, totalPages };
};

const getSingleNews = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "This is not vaild");
  }
  const news = await News.findById(id);
  if (!news) throw new AppError(404, "News not found");
  return news;
};

const deleteNews = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "This is not vaild");
  }
  const news = await News.findByIdAndDelete(id);
  if (!news) throw new AppError(404, "News not found");
  return news;
};

const editNews = async (
  id: string,
  payload: Pick<CreateNewsDto, "title" | "details" | "link" | "published" | "category">,
  file?: Express.Multer.File
) => {
  let uploadUrl;
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "This is not vaild");
  }
  if (file) {
    uploadUrl = (await fileUploader.CloudinaryUpload(file)) as {
      secure_url: string;
    };
  }
  const updatedPayload = {
    ...payload,
    ...(uploadUrl && { image: uploadUrl.secure_url }),
  };
  const cleanedPayload = sanitizePayload(updatedPayload);
  const updateNews = await News.findByIdAndUpdate(
    id,
    {
      $set: cleanedPayload,
    },
    { new: true, runValidators: true }
  );
  return updateNews;
};

export const NewsService = {
  createNews,
  getAllNews,
  getSingleNews,
  deleteNews,
  editNews,
};
