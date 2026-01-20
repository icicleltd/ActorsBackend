"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialCounterController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const serialCounter_services_1 = require("./serialCounter.services");
/* ------------------------------------
   GET NEXT SERIAL (Be a Member)
------------------------------------- */
const nextBeAMemberSerial = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const result = await serialCounter_services_1.SerialCounterService.getNextSerial(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Serial generated successfully",
        data: {
            serial: result.seq,
        },
    });
});
/* ------------------------------------
   GET CURRENT SERIAL (Optional)
------------------------------------- */
const getCurrentBeAMemberSerial = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await serialCounter_services_1.SerialCounterService.getCurrentSerial("be_a_member");
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Current serial fetched successfully",
        data: {
            serial: result?.seq ?? null,
        },
    });
});
/* ------------------------------------
   EXPORT CONTROLLER
------------------------------------- */
exports.SerialCounterController = {
    nextBeAMemberSerial,
    getCurrentBeAMemberSerial,
};
