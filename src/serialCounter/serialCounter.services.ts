import { AppError } from "../middleware/error";
import { ICounterPayload } from "./serialCounter.interface";
import { Counter } from "./serialCounter.schema";

/* ------------------------------------
   GET NEXT SERIAL (AUTO CREATE)
------------------------------------- */
const getNextSerial = async (payload: ICounterPayload) => {
  if (!payload?.name) {
    throw new AppError(400, "Counter name is required");
  }

  const counter = await Counter.findOneAndUpdate(
    { name: payload.name },
    {
      $inc: { seq: 1 },
    },
    {
      new: true,
      upsert: true,
    },
  );

  if (!counter) {
    throw new AppError(400, "Failed to generate serial");
  }

  return counter;
};

/* ------------------------------------
   GET CURRENT SERIAL (NO INCREMENT)
------------------------------------- */
const getCurrentSerial = async (name: string) => {
  if (!name) {
    throw new AppError(400, "Counter name is required");
  }

  const counter = await Counter.findOne({ name });

  return counter;
};

/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
export const SerialCounterService = {
  getNextSerial,
  getCurrentSerial,
};
