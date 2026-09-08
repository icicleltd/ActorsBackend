"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaDirectoryService = void 0;
const mongoose_1 = require("mongoose");
const senitizePayload_1 = require("../helper/senitizePayload");
const error_1 = require("../middleware/error");
const mediaDirectory_schema_1 = require("./mediaDirectory.schema");
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
const updateMediaDirectory = async (id, payload) => {
    if (!id) {
        throw new error_1.AppError(400, "Media Directory Id not found");
    }
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "Invalid Media Directory Id");
    }
    const cleanedPayload = (0, senitizePayload_1.sanitizePayload)(payload);
    const result = await mediaDirectory_schema_1.MediaDirectory.findByIdAndUpdate(id, {
        $set: cleanedPayload,
    }, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new error_1.AppError(404, "Media Directory not found");
    }
    return result;
};
const deleteMediaDirectory = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Media Directory Id not found");
    }
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "Invalid Media Directory Id");
    }
    const result = await mediaDirectory_schema_1.MediaDirectory.findByIdAndDelete(id);
    if (!result) {
        throw new error_1.AppError(404, "Media Directory not found");
    }
    return result;
};
exports.MediaDirectoryService = {
    createMediaDirectory,
    getMediaDirectory,
    updateMediaDirectory,
    deleteMediaDirectory,
};
