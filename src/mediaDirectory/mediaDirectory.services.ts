import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import {
  CreateEventDto,
  ICreateMediaDirectory,
  MediaDirectoryType,
} from "./mediaDirectory.interface";
import { MediaDirectory } from "./mediaDirectory.schema";

// const producer = async (payload: any) => {
//   if (!producer) {
//     throw new AppError(400, "producer info required");
//   }
//   console.log(first)
//   const newProducer = await MediaDirectory.create({
//     ...payload,
//     type: "producer",
//   });
//   if (!newProducer) {
//     throw new AppError(500, "Producer not created");
//   }
//   console.log(newProducer)
//   return newProducer;
// };
const createMediaDirectory = async (payload: ICreateMediaDirectory) => {
  if (!payload) {
    throw new AppError(400, "MediaDirectory info required");
  }
  const newMediaDirectory = await MediaDirectory.create(payload);
  if (!newMediaDirectory) {
    throw new AppError(500, "MediaDirectory not created");
  }
  return newMediaDirectory;
};
const getMediaDirectory = async (payload: MediaDirectoryType) => {
  if (!payload) {
    throw new AppError(400, "MediaDirectory info required");
  }
  const result = await MediaDirectory.find({
    mediaRole: payload,
  });

  if (!result) {
    throw new AppError(500, "MediaDirectory not created");
  }
  return result;
};

export const MediaDirectoryService = {
  createMediaDirectory,
  getMediaDirectory,
};
