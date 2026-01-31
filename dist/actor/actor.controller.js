"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const actor_services_1 = require("./actor.services");
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const error_1 = require("../middleware/error");
const createActor = (0, catchAsync_1.default)(async (req, res, next) => {
    const files = req.files;
    const data = req.body;
    const result = await actor_services_1.ActorService.createActor(files, data);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Actors retrieved successfully",
        data: result,
    });
});
const getSingleActor = (0, catchAsync_1.default)(async (req, res, next) => {
    const actorId = req.params.id;
    console.log(actorId);
    const result = await actor_services_1.ActorService.getSingleActor(actorId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Single actor fetch successfully",
        data: result,
    });
});
const getAllActor = (0, catchAsync_1.default)(async (req, res, next) => {
    const search = req.query.search;
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 1;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const sortBy = req.query.sortBy || "createdAt";
    const sortWith = req.query.sortWith === "asc" ? 1 : -1;
    const executiveRank = req.query.executiveRank;
    const rankGroup = req.query.rankGroup;
    // Dynamically calculate the latest year range (e.g., 2025-2028)
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - (currentYear % 3); // Find the nearest previous multiple of 3 (e.g., 2025, 2022, etc.)
    const endYear = startYear + 3; // Add 3 years to get the end year
    const defaultYearRange = `${startYear}-${endYear}`;
    // Use the dynamic year range if searchYearRange is not provided
    const searchYearRange = req.query.searchYearRange;
    const advisorYearRange = req.query.advisorYearRange;
    const result = await actor_services_1.ActorService.getAllActor(search, page, limit, skip, category, sortBy, sortWith, executiveRank, rankGroup, searchYearRange, advisorYearRange);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All actor fetch successfully",
        data: result,
    });
});
const filterByRank = (0, catchAsync_1.default)(async (req, res, next) => {
    const rank = req.params.rank;
    const result = await actor_services_1.ActorService.filterByRank(rank);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Get data by rank successfully",
        data: result,
    });
});
const updateActor = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.params.id;
    const files = req.files; // Uploaded files
    const payload = req.body;
    if (!id) {
        throw new error_1.AppError(400, "Actor ID is required");
    }
    const updatedActor = await actor_services_1.ActorService.updateActor(payload, files, id);
    // if (!updatedActor) {
    //   throw new AppError(404, "Actor not found");
    // }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Actor updated successfully",
        data: updatedActor,
    });
});
const getActorForModal = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.query.id;
    const search = req.query.search;
    const alive = req.query.alive;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || "createdAt";
    const sortWith = req.query.sortWith === "asc" ? 1 : -1;
    const result = await actor_services_1.ActorService.getActorForModal(id, search, limit, sortBy, sortWith, alive);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Actor get successfully",
        data: result,
    });
});
// const test = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     let a: any;
//     const b = "abc";
//     const result = await ActorService.updateActor(a, b);
//     sendResponse(res, {
//       statusCode: 201,
//       success: true,
//       message: "Actor Promoted successfully",
//       data: result,
//     });
//   }
// );
exports.ActorController = {
    createActor,
    getSingleActor,
    getAllActor,
    filterByRank,
    updateActor,
    getActorForModal,
};
