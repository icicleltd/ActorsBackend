import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { ScheduleService } from "./appointments.services";

/* ------------------------------------
   CREATE / UPDATE SCHEDULE (Admin)
------------------------------------- */
const createSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const files = req.files;

    const result = await ScheduleService.createSchedule(payload, files);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Schedule created successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   GET ALL SCHEDULES (Frontend/Admin)
------------------------------------- */
const getSchedules = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sortBy = (req.query?.sortBy as string) || "order";
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;
    const approver = req.query?.approver as string;
    const result = await ScheduleService.getSchedules(
      sortBy,
      sortWith,
      approver,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Schedules fetched successfully",
      data: result,
    });
  },
);

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
const reorderSchedules = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ScheduleService.reorderSchedules(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Schedule order updated successfully",
      data: result,
    });
  },
);

export const ScheduleController = {
  createSchedule,
  getSchedules,
  reorderSchedules,
};
