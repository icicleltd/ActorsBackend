import { Schema, model } from "mongoose";
import { IYoutube } from "./youtube.interface";

const youtubeSchema = new Schema<IYoutube>(
  {
    title: {
      type: String,
      trim: true,
    },

    url: {
      type: String,
      trim: true,
       required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Youtube = model<IYoutube>("Youtube", youtubeSchema);
