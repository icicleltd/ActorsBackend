import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { SerialCounterService } from "./serialCounter.services";

/* ------------------------------------
   GET NEXT SERIAL (Be a Member)
------------------------------------- */
const nextBeAMemberSerial = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await SerialCounterService.getNextSerial(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Serial generated successfully",
      data: {
        serial: result.seq,
      },
    });
  },
);

/* ------------------------------------
   GET CURRENT SERIAL (Optional)
------------------------------------- */
const getCurrentBeAMemberSerial = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await SerialCounterService.getCurrentSerial("be_a_member");

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Current serial fetched successfully",
      data: {
        serial: result?.seq ?? null,
      },
    });
  },
);

/* ------------------------------------
   EXPORT CONTROLLER
------------------------------------- */
export const SerialCounterController = {
  nextBeAMemberSerial,
  getCurrentBeAMemberSerial,
};
