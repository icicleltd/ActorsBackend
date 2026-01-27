import { PayloadLoign } from "./../admin/admin.interface";
import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { BeAMemberService } from "./beAMember.services";
import { IBeAMemberPayload } from "./beAMember.interface";

/* ------------------------------------
   CREATE BE A MEMBER (Admin)
------------------------------------- */
const createBeAMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const PayloadBeAMember: IBeAMemberPayload = req.body;

    const result = await BeAMemberService.createBeAMember(PayloadBeAMember);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Be a Member created successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   GET ALL BE A MEMBERS (Frontend/Admin)
------------------------------------- */
const getBeAMembers = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query?.limit as string) || 10;
    const page = parseInt(req.query?.page as string) || 1;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortWith: 1 | -1 = req.query.sortWith === "asc" ? 1 : -1;
    const id = req.user.data._id;
    const role = req.user.data.role;
    const result = await BeAMemberService.getBeAMembers(
      limit,
      skip,
      sortBy,
      sortWith,
      id,
      role,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Be a Members fetched successfully",
      data: result,
    });
  },
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
  },
);
const approveByAdmin = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, rejectionReason, message } = req.body;
    const adminId = req.user._id;
    const result = await BeAMemberService.approveByAdmin({
      id,
      status,
      rejectionReason,
      adminId,
      message,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin Approved successfully ",
      data: result,
    });
  },
);

const approveByMember = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, rejectionReason, message } = req.body;
    const actorId = req.user.data._id;
    const result = await BeAMemberService.approveByMember({
      id,
      status,
      actorId,
      message,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Member Approved successfully",
      data: result,
    });
  },
);

/* ------------------------------------
   EXPORT CONTROLLER
------------------------------------- */
export const BeAMemberController = {
  createBeAMember,
  getBeAMembers,
  deleteBeAMember,
  approveByAdmin,
  approveByMember,
};
