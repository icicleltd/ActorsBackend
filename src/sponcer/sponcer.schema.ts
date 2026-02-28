import { Schema, model } from "mongoose";
import { ISponcer } from "./sponcer.interface";

const sponcerSchema = new Schema<ISponcer>(
  {
    url: {
      type: String,
      trim: true,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    terms: {
      type: String,
      trim: true,
      required: true,
    },
    discount: {
      type: String,
      trim: true,
      required: true,
    },
    validity: {
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
