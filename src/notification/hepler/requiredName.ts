import { AppError } from "../../middleware/error";

export const requiredString = (value: unknown, fieldName: string) => {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${fieldName} is required`);
  }
};