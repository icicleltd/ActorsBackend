import { Schema, model } from "mongoose";
import { ICounter } from "./serialCounter.interface";

const counterSchema = new Schema<ICounter>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 1000,
    },
  },
  {
    timestamps: true,
  },
);

export const Counter = model<ICounter>("Counter", counterSchema);
