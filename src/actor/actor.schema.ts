import mongoose, { Schema } from "mongoose";
import type { IActor } from "./actor.interface.js";

const actorSchema = new Schema<IActor>(
  {
    // Required
    fullName: { type: String, required: true },

    // Basic Info
    motherName: { type: String },
    fatherName: { type: String },
    birthPlace: { type: String },
    presentAddress: { type: String },
    permanentAddress: { type: String },
    nationality: { type: String },
    religion: { type: String },
    dob: { type: String },
    bloodGroup: { type: String },

    // Contact
    email: { type: String },
    phoneNumber: { type: String,unique:true },
    whatsApp: { type: String },
    nid: { type: String },
    passport: { type: String },

    // Social Media
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    youtubeLink: { type: String }, // main youtube profile link

    // YouTube video links
    youtubeVideos: [{ type: String }],

    // Drama / Film Acted Details
    actedDramaAndFilmDetails: [
      {
        filmAndDramaName: { type: String },
        characterName: { type: String },
        directorName: { type: String },
        broadcastMedium: { type: String },
      },
    ],

    educationQualification: { type: String },
    emergencyNumber: { type: String },
    stageAndFilmAdditionalSkills: { type: String },

    // Actor Reference
    actorReference: [
      {
        actorId: { type: Schema.Types.ObjectId, ref: "Actor", required: true },
        name: { type: String },
        idNo: { type: String },
      },
    ],

    // Admin Added Member Info
    idNo: { type: String , unique: true},
    rank: { type: String },
    occupation: { type: String },
    actorName: { type: String },
    otherName: { type: String },
    spouse: { type: String },
    bio: { type: String, default: "" },

    fromActive: { type: String },
    endActive: { type: String, default: null },
    presentActive: { type: String, default: null },

    // Physical Info
    height: { type: String },
    weight: { type: String },

    // Work/Personal Info
    workExperience: { type: String },
    workSocialMediaInfo: { type: String },
    educationInfo: { type: String },
    personalInfo: { type: String },
    basicInfo: { type: String },

    // Photos
    profilePhoto: [
      {
        left: { type: String },
        right: { type: String },
        front: { type: String },
      },
    ],

    photo: { type: String },
    characterPhoto: [{ type: String }],

    // Intro Video
    introVideo: {
      url: { type: String },
      duration: { type: Number, max: 30 },
      sizeMB: { type: Number, max: 100 },
    },

    // Category & Status
    category: { type: String, enum: ["A", "B"] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Actor = mongoose.model<IActor>("Actor", actorSchema);
export default Actor;
