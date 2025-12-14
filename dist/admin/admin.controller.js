"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const admin_services_1 = require("./admin.services");
const createAdmin = (0, catchAsync_1.default)(async (req, res, next) => {
    const data = req.body;
    const result = await admin_services_1.AdminService.createAdmin(data);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Admin created successfully",
        data: result,
    });
});
const readNotificaton = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await admin_services_1.AdminService.readAdmin();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Not successfully",
        data: result,
    });
});
const updateActorProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const data = req.body;
    const actorId = req.params.id;
    const result = await admin_services_1.AdminService.updateActorProfile(data, actorId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Actor profile filled up successfully",
        data: result,
    });
});
const getAdmin = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await admin_services_1.AdminService.getAdmin();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admin fetched successfully",
        data: result,
    });
});
const addActor = (0, catchAsync_1.default)(async (req, res, next) => {
    const file = req.file;
    const data = req.body;
    const result = await admin_services_1.AdminService.addActor(file, data);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Actor added successfully",
        data: result,
    });
});
const promoteMember = (0, catchAsync_1.default)(async (req, res, next) => {
    const data = req.body;
    console.log(data, "in body");
    const result = await admin_services_1.AdminService.promoteMember(data);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Actor Promoted successfully",
        data: result,
    });
});
exports.AdminController = {
    createAdmin,
    getAdmin,
    readNotificaton,
    updateActorProfile,
    addActor,
    promoteMember,
};
