import { Schema, model, Types } from "mongoose";
import { IEvent } from "./event.interface";

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      // required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    logo: String,
    banner: String,

    images: {
      type: [String],
      default: [],
    },

    eventDate: {
      type: Date,
      required: true,
    },

    isBookingOpen: {
      type: Boolean,
      default: false,
    },

    // ONLY COUNT
    registrationCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "Admin",
      // required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
eventSchema.virtual("remainingDays").get(function () {
  if (!this.eventDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(this.eventDate);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

eventSchema.virtual("eventType").get(function () {
  return this.eventDate > new Date() ? "UPCOMING" : "PAST";
});

export const Event = model<IEvent>("Event", eventSchema);
