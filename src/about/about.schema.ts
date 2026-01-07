import { Schema, model } from "mongoose";
import { IAbout } from "./about.interface";

const aboutSchema = new Schema<IAbout>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    points: {
      type: [String],
      default: [],
    },

    images: [
      {
        year: {
          type: String,
          required: true,
          trim: true,
        },
        src: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const About = model<IAbout>("About", aboutSchema);
