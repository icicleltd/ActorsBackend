import { Types } from "mongoose";

export interface ISchedule {
  title: string;
  description?: string;

  date: Date;
  startTime: string; // "10:00"
  endTime: string;   // "18:00"

  location?: string;

  // 🔗 Reference Actor(s)
  actors: Types.ObjectId[];

  scheduleType: "shooting" | "rehearsal" | "meeting" | "event";

  status: "scheduled" | "completed" | "cancelled";

  createdBy?: Types.ObjectId;
}