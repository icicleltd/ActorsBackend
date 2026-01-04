import { Types } from "mongoose";
import { fileUploader } from "../helper/fileUpload";
import { sanitizePayload } from "../helper/senitizePayload";
import { AppError } from "../middleware/error";
import {
  AllowedMediaDirectoryFields,
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

const updateMediaDirectory = async (
  id: string,
  payload: AllowedMediaDirectoryFields
) => {
  if (!id) {
    throw new AppError(400, "Media Directory Id not found");
  }
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Media Directory Id");
  }
  const cleanedPayload = sanitizePayload(payload);
  const result = await MediaDirectory.findByIdAndUpdate(
    id,
    {
      $set: cleanedPayload,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!result) {
    throw new AppError(404, "Media Directory not found");
  }
  return result;
};
const deleteMediaDirectory = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Media Directory Id not found");
  }
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Media Directory Id");
  }
  const result = await MediaDirectory.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, "Media Directory not found");
  }
  return result;
};

export const MediaDirectoryService = {
  createMediaDirectory,
  getMediaDirectory,
  updateMediaDirectory,
  deleteMediaDirectory,
};
