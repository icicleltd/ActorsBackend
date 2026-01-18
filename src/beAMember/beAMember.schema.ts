import mongoose, { Schema } from "mongoose";
import { IBeAMember } from "./beAMember.interface";

const beAMemberSchema = new Schema<IBeAMember>(
  {
    // Required
    fullName: { type: String, required: true, trim: true },

    // Basic Info
    motherName: { type: String, required: true, trim: true },
    professionalName: { type: String },
    fatherName: { type: String, required: true, trim: true },
    birthPlace: { type: String, required: true, trim: true },
    presentAddress: { type: String, required: true, trim: true },
    permanentAddress: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    religion: { type: String, required: true, trim: true },
    dob: { type: Date, required: true, trim: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
      trim: true,
    },

    // Contact
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    whatsApp: { type: String, required: true, trim: true },
    nid: { type: String, required: true, trim: true },
    passport: { type: String },

    // Social Media
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    youtubeLink: { type: String },

    youtubeVideos: [{ type: String }],

    actedDramaAndFilmDetails: {
      type: [
        {
          filmAndDramaName: { type: String, required: true },
          characterName: { type: String, required: true },
          directorName: { type: String, required: true },
          broadcastMedium: { type: String, required: true },
        },
      ],
      required: true,
      validate: {
        validator: (v: any[]) => v.length >= 10,
        message: "At least 10 acted drama or film details are required",
      },
    },

    educationQualification: { type: String, required: true, trim: true },
    emergencyNumber: { type: String, required: true, trim: true },
    stageAndFilmAdditionalSkills: { type: String, required: true, trim: true },

    actorReference: [
      {
        actorId: { type: Schema.Types.ObjectId, ref: "Actor", required: true },
        name: { type: String },
        idNo: { type: String },
      },
    ],

    height: { type: String },
    weight: { type: String },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    seq: { type: Number },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const BeAMember = mongoose.model<IBeAMember>("BeAMember", beAMemberSchema);
export default BeAMember;
