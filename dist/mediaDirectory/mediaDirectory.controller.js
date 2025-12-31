"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaDirectoryController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const mediaDirectory_services_1 = require("./mediaDirectory.services");
const error_1 = require("../middleware/error");
const createMediaDirectory = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    // const adminId = req.user?.id;
    const result = await mediaDirectory_services_1.MediaDirectoryService.createMediaDirectory(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "MediaDirectory created successfully",
        data: result,
    });
});
const getMediaDirectory = (0, catchAsync_1.default)(async (req, res, next) => {
    const { mediaRole } = req.query;
    if (!mediaRole || typeof mediaRole !== "string") {
        throw new error_1.AppError(400, "mediaRole query is required");
    }
    const result = await mediaDirectory_services_1.MediaDirectoryService.getMediaDirectory(mediaRole);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "MediaDirectory fetched successfully",
        data: result,
    });
});
// const getAdminEvents = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const adminId = req.params.id;
//     const result = await EventService.getAdminEvents(adminId);
//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Admin events fetched successfully",
//       data: result,
//     });
//   }
// );
// const readEvent = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const eventId = req.params.id;
//     const result = await EventService.readEvent(eventId);
//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Event updated successfully",
//       data: result,
//     });
//   }
// );
exports.MediaDirectoryController = {
    createMediaDirectory,
    getMediaDirectory,
};
