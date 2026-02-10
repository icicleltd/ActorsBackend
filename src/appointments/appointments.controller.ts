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
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 10;
    const skip = (page - 1) * limit;
    const result = await ScheduleService.getSchedules(
      sortBy,
      sortWith,
      approver,
      skip,
      limit,
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
const approve = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const userId = req.user.data._id;
    const { date, email, idNo } = req.body;
    const memberName = req.user.data.fullName;
    const result = await ScheduleService.approve(
      id,
      userId,
      date,
      email,
      memberName,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Schedule approve successfully",
      data: result,
    });
  },
);
const getMyMonthlyApprovedSchedules = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { month, year } = req?.query;
    const actorId = req.user?.data?._id;

    if (!month || !year) {
      return res.status(400).json({
        message: "month and year are required",
      });
    }
    const result = await ScheduleService.getMyMonthlyApprovedSchedules(
      actorId,
      Number(month),
      Number(year),
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Schedule approve successfully",
      data: result,
    });
  },
);

export const ScheduleController = {
  createSchedule,
  getSchedules,
  reorderSchedules,
  approve,
  getMyMonthlyApprovedSchedules,
};
