import { NextFunction, Request, Response } from "express";
import catchAsync from "../shared/catchAsync";
import { ActorPaymentService } from "./actor.payment.services";
import sendResponse from "../shared/sendResponse";

const actorPaymentInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id as string;
    const search = req.query.search as string;
    const alive = req.query.alive as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortWith: 1 | -1 = req.query.sortWith === "asc" ? 1 : -1;
    const year = parseInt(req.query.year as string);
    const status = (req.query.status as "paid" | "pending") || "pending";

    const result = await ActorPaymentService.actorPaymentInfo(
      id,
      search,
      limit,
      sortBy,
      sortWith,
      alive,
      year,
      status,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Actor get successfully",
      data: result,
    });
  },
);
const notifyActorForPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await ActorPaymentService.notifyActorForPayment(payload);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notify payment successfully",
      data: result,
    });
  },
);

const fetchNotifyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.query.uid as string;
    const result = await ActorPaymentService.fetchNotifyPayments(idNo);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Fetch Notify payment successfully",
      data: result,
    });
  },
);

const paymentSubmitted = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { notifyPaymentId, senderNumber, transactionId, type, year, amount } =
      req.body;
    const actorId = req.user.data._id;
    const result = await ActorPaymentService.paymentSubmitted(
      senderNumber,
      transactionId,
      notifyPaymentId,
      actorId,
      type,
      year,
      amount,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment submitted successfully",
      data: result,
    });
  },
);
const fetchActorPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idNo = req.query.uid as string;
    const result = await ActorPaymentService.fetchActorPayments(idNo);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Fetch Notify payment successfully",
      data: result,
    });
  },
);
const verifyActorPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId, notifyPayment } = req.body;
    const result = await ActorPaymentService.verifyActorPayment(
      paymentId,
      notifyPayment,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment verify successfully",
      data: result,
    });
  },
);

export const ActorPaymentController = {
  actorPaymentInfo,
  notifyActorForPayment,
  fetchNotifyPayments,
  paymentSubmitted,
  fetchActorPayments,
  verifyActorPayment,
};
