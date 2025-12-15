import { NextFunction, Request, Response } from "express";
import { AppError } from "./error";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];

    error = new AppError(
      409,
      `${field} "${value}" already exists. Please use a different one.`
    );
  }
  // 🔴 Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);

    error = new AppError(400, messages.join(", "));
  }

  // 🔴 CastError (invalid ObjectId)
  if (error.name === "CastError") {
    error = new AppError(400, `Invalid ${error.path}: ${error.value}`);
  }
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
