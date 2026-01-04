import { Schema, model } from "mongoose";
import { IGallery } from "./galary.interface";

const gallerySchema = new Schema<IGallery>(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Gallery = model<IGallery>("Gallery", gallerySchema);
