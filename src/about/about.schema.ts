import { Schema, model, Types } from "mongoose";
import { IAbout } from "./about.interface";

const pointSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);

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

    points: [
      {
        point: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    images: [
      {
        year: {
          type: String,
          required: true,
          trim: true,
        },
        image: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

export const About = model<IAbout>("About", aboutSchema);
