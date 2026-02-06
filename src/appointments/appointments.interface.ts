import { Types } from "mongoose";

export interface ISchedule {
  title?: string;

  name: string;
  phone: string;
  email: string;
  message?: string;

  date: Date;
  startTime?: string; // "10:00"
  endTime?: string; // "18:00"

  location?: string;

  pdfLinks?: string[];

  approver: Types.ObjectId;

  scheduleType?: "shooting" | "rehearsal" | "meeting" | "event";

  status: "pending" | "approved" | "rejected";
  isView: boolean

  createdBy?: Types.ObjectId;
}
