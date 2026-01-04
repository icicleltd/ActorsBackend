import { Schema, model } from "mongoose";
import { IMediaDirectory } from "./mediaDirectory.interface";

const mediaDirectorySchema = new Schema<IMediaDirectory>(
  {
    houseName: {
      type: String,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    mediaRole: {
      type: String,
      enum: [
        "producer",
        "director",
        "script_writer",
        "dop",
        "makeup_artist",
        "shooting_house",
        "tv_channel",
        "finance_and_contract",
      ],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MediaDirectory = model<IMediaDirectory>(
  "MediaDirectory",
  mediaDirectorySchema
);
