import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import {
  CreateEventDto,
  ICreateMediaDirectory,
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

export const MediaDirectoryService = {
  createMediaDirectory,
};
