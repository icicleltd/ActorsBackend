"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const appointments_services_1 = require("./appointments.services");
/* ------------------------------------
   CREATE / UPDATE SCHEDULE (Admin)
------------------------------------- */
const createSchedule = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const files = req.files;
    const result = await appointments_services_1.ScheduleService.createSchedule(payload, files);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Schedule created successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL SCHEDULES (Frontend/Admin)
------------------------------------- */
const getSchedules = (0, catchAsync_1.default)(async (req, res, next) => {
    const sortBy = req.query?.sortBy || "order";
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const approver = req.query?.approver;
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 10;
    const skip = (page - 1) * limit;
    const result = await appointments_services_1.ScheduleService.getSchedules(sortBy, sortWith, approver, skip, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Schedules fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE SINGLE SCHEDULE (Admin)
------------------------------------- */
// const deleteSchedule = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params;
//     const result = await ScheduleService.deleteSchedule(id);
//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Schedule deleted successfully",
//       data: result,
//     });
//   }
// );
/* ------------------------------------
   DELETE ALL SCHEDULES (Admin)
------------------------------------- */
// const deleteAllSchedules = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const result = await ScheduleService.deleteAllSchedules();
//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "All schedules deleted successfully",
//       data: result,
//     });
//   }
// );
/* ------------------------------------
   REORDER SCHEDULES (Admin)
------------------------------------- */
const reorderSchedules = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await appointments_services_1.ScheduleService.reorderSchedules(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Schedule order updated successfully",
        data: result,
    });
});
const approve = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.params.id;
    const userId = req.user.data._id;
    const { date, email, idNo } = req.body;
    const memberName = req.user.data.fullName;
    const result = await appointments_services_1.ScheduleService.approve(id, userId, date, email, memberName);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Schedule approve successfully",
        data: result,
    });
});
const getMyMonthlyApprovedSchedules = (0, catchAsync_1.default)(async (req, res, next) => {
    const { month, year } = req?.query;
    const actorId = req.user?.data?._id;
    if (!month || !year) {
        return res.status(400).json({
            message: "month and year are required",
        });
    }
    const result = await appointments_services_1.ScheduleService.getMyMonthlyApprovedSchedules(actorId, Number(month), Number(year));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Schedule approve successfully",
        data: result,
    });
});
exports.ScheduleController = {
    createSchedule,
    getSchedules,
    reorderSchedules,
    approve,
    getMyMonthlyApprovedSchedules,
};
