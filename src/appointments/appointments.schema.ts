import mongoose, { Schema, Types } from "mongoose";
import { ISchedule } from "./appointments.interface";

const scheduleSchema = new Schema<ISchedule>(
  {
    title: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
    },

    dates: {
      type: [Date],
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },

    location: {
      type: String,
      trim: true,
    },

    approver: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
      required: true,
    },

    scheduleType: {
      type: String,
      enum: ["shooting", "rehearsal", "meeting", "event"],
      default: "shooting",
    },

    pdfLinks: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isView: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
    },
  },
  {
    timestamps: true,
  },
);

scheduleSchema.index({ dates: 1 });
scheduleSchema.index({ actors: 1 });

const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);

export default Schedule;