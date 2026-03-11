import { Types } from "mongoose";

// appointments.interface.ts
export interface ISchedule {
  title?: string;
  message?: string;
  dates: Date[];        // ← was: date: Date
  name: string;
  phone: string;
  email: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  approver: Types.ObjectId;
  scheduleType?: "shooting" | "rehearsal" | "meeting" | "event";
  pdfLinks?: string[];
  status?: "pending" | "approved" | "rejected";
  isView?: boolean;
  createdBy?: Types.ObjectId;
}
