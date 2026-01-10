import { Schema, model } from "mongoose";
import { IBanner } from "./banner.interface";

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Banner = model<IBanner>("Banner", bannerSchema);
