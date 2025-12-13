"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const actor_services_1 = require("./actor.services");
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
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
    const sortWith = req.query.sortWith === "asc" ? 1 : -1 || -1;
    console.log(sortBy, sortWith);
    const result = await actor_services_1.ActorService.getAllActor(search, page, limit, skip, category, sortBy, sortWith);
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
exports.ActorController = {
    createActor,
    getSingleActor,
    getAllActor,
    filterByRank,
};
