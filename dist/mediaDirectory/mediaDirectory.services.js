"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaDirectoryService = void 0;
const error_1 = require("../middleware/error");
const mediaDirectory_schema_1 = require("./mediaDirectory.schema");
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
const createMediaDirectory = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "MediaDirectory info required");
    }
    const newMediaDirectory = await mediaDirectory_schema_1.MediaDirectory.create(payload);
    if (!newMediaDirectory) {
        throw new error_1.AppError(500, "MediaDirectory not created");
    }
    return newMediaDirectory;
};
const getMediaDirectory = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "MediaDirectory info required");
    }
    const result = await mediaDirectory_schema_1.MediaDirectory.find({
        mediaRole: payload,
    });
    if (!result) {
        throw new error_1.AppError(500, "MediaDirectory not created");
    }
    return result;
};
exports.MediaDirectoryService = {
    createMediaDirectory,
    getMediaDirectory,
};
