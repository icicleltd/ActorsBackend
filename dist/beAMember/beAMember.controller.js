"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeAMemberController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const beAMember_services_1 = require("./beAMember.services");
/* ------------------------------------
   CREATE BE A MEMBER (Admin)
------------------------------------- */
const createBeAMember = (0, catchAsync_1.default)(async (req, res, next) => {
    const PayloadBeAMember = req.body;
    const result = await beAMember_services_1.BeAMemberService.createBeAMember(PayloadBeAMember);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Be a Member created successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL BE A MEMBERS (Frontend/Admin)
------------------------------------- */
const getBeAMembers = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await beAMember_services_1.BeAMemberService.getBeAMembers();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Be a Members fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE SINGLE BE A MEMBER (Admin)
------------------------------------- */
const deleteBeAMember = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await beAMember_services_1.BeAMemberService.deleteBeAMember(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Be a Member deleted successfully",
        data: result,
    });
});
/* ------------------------------------
   EXPORT CONTROLLER
------------------------------------- */
exports.BeAMemberController = {
    createBeAMember,
    getBeAMembers,
    deleteBeAMember,
};
