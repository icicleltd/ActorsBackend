import mongoose, { Schema } from "mongoose";
import type { IActor } from "./actor.interface.js";

const actorSchema = new Schema<IActor>(
  {
    fullName: { type: String, required: true }, // ONLY required field

    idNo: { type: String },
    rank: { type: String },
    motherName: { type: String },
    fatherName: { type: String },
    presentAddress: { type: String },
    dob: { type: String },
    bloodGroup: { type: String },
    occupation: { type: String },

    email: { type: String },
    phoneNumber: { type: String },
    NID: { type: String },
    passport: { type: String },

    actorName: { type: String },
    otherName: { type: String },
    spouse: { type: String },

    bio: { type: String, default: "" },

    fromActive: { type: String },
    endActive: { type: String, default: null },
    presentActive: { type: String, default: null },

    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },

    height: { type: String },
    weight: { type: String },

    workExperience: { type: String },
    workSocialMediaInfo: { type: String },
    educationInfo: { type: String },
    personalInfo: { type: String },
    basicInfo: { type: String },

    profilePhoto: [
      {
        left: String,
        right: String,
        front: String,
      },
    ],
    photo: { type: String },
    characterPhoto: [{ type: String }],
    introVideo: {
      url: { type: String },
      duration: {
        type: Number,
        max: 30, // must be <= 30 seconds
      },
      sizeMB: {
        type: Number,
        max: 100, // must be <= 100 MB
      },
    },
    youtubeLink: [{ type: String }],
    category: { enum: ["A", "B"], type: String },
    status: {
      enum: ["pending", "approved", "rejected"],
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);
const Actor = mongoose.model<IActor>("Actor", actorSchema);
export default Actor;
