import mongoose, { Schema, Types } from "mongoose";
import { ISchedule } from "./appointments.interface";



const scheduleSchema = new Schema<ISchedule>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },

    // ✅ Actor reference (many-to-many)
    actors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Actor",
        required: true,
      },
    ],

    scheduleType: {
      type: String,
      enum: ["shooting", "rehearsal", "meeting", "event"],
      default: "shooting",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },

    // optional (admin / user)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
    },
  },
  {
    timestamps: true,
  }
);

/* ===============================
   🔎 Indexes (Important)
================================ */
scheduleSchema.index({ date: 1 });
scheduleSchema.index({ actors: 1 });

const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);

export default Schedule;
