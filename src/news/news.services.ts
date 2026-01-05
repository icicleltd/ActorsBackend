import { AppError } from "../middleware/error";
import { fileUploader } from "../helper/fileUpload";
import { News } from "./news.schema";
import { CreateNewsDto } from "./news.interface";

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
  });
  console.log(news);
  return news;
};

const getAllNews = async (
  limit: number,
  page: number,
  sortBy: string,
  sortWith: 1 | -1,
  skip: number
) => {
  return News.find()
    .sort({ [sortBy]: sortWith })
    .skip(skip)
    .limit(limit);
};

const getSingleNews = async (id: string) => {
  const news = await News.findById(id);
  if (!news) throw new AppError(404, "News not found");
  return news;
};

const deleteNews = async (id: string) => {
  const news = await News.findByIdAndDelete(id);
  console.log(news);
  if (!news) throw new AppError(404, "News not found");
  return news;
};

export const NewsService = {
  createNews,
  getAllNews,
  getSingleNews,
  deleteNews,
};
