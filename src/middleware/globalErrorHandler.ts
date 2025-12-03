import { NextFunction, Request, Response } from "express";
import { AppError } from "./error";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if error is an AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  res.status(500).json({
    success: false,
    message: error?.message || "Something went wrong",
    error: error,
  });
};
export default globalErrorHandler;
