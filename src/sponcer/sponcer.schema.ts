import { Schema, model } from "mongoose";
import { ISponcer } from "./sponcer.interface";

const sponcerSchema = new Schema<ISponcer>(
  {
    url: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Sponcer = model<ISponcer>("Sponcer", sponcerSchema);
