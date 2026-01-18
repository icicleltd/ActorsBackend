import { PayloadLoign } from '../admin/admin.interface';
import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { BeAMemberService } from "./payment.services";

/* ------------------------------------
   CREATE BE A MEMBER (Admin)
------------------------------------- */
const createBeAMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const PayloadBeAMember = req.body;

    const result = await BeAMemberService.createBeAMember(PayloadBeAMember);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Be a Member created successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET ALL BE A MEMBERS (Frontend/Admin)
------------------------------------- */
const getBeAMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await BeAMemberService.getBeAMembers();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Be a Members fetched successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   DELETE SINGLE BE A MEMBER (Admin)
------------------------------------- */
const deleteBeAMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await BeAMemberService.deleteBeAMember(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Be a Member deleted successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   EXPORT CONTROLLER
------------------------------------- */
export const BeAMemberController = {
  createBeAMember,
  getBeAMembers,
  deleteBeAMember,
};
