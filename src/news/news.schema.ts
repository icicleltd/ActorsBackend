import { Schema, model } from "mongoose";
import { INews } from "./news.interface";

const newsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    published: {
      type: Date,
      required: true,
    },

    link: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const News = model<INews>("News", newsSchema);
