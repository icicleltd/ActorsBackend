import { PayloadLoign } from "../admin/admin.interface";
import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { BeAMemberPaymentService } from "./payment.services";
import { skip } from "node:test";

/* ------------------------------------
   CREATE BE A MEMBER (Admin)
------------------------------------- */
const getBeAMemberPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;

    const result = await BeAMemberPaymentService.getBeAMemberPayments({
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Be a Member payment get successfully",
      data: result,
    });
  },
);

const verifyPayment = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;
    const { status, rejectionReason, message } = req.body;

    const adminId = req.user._id;

    const result = await BeAMemberPaymentService.verifyPayment({
      paymentId: id,
      status,
      rejectionReason,
      adminId,
      message,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin Approved successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   EXPORT CONTROLLER
------------------------------------- */
export const BeAMemberPaymentController = {
  getBeAMemberPayments,
  verifyPayment,
};
