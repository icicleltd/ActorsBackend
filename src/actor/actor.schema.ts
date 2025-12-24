import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
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
    dob: { type: Date },
    bloodGroup: { type: String },

    // Contact
    email: { type: String },
    password: {
      type: String,
      minlength: 6,
      select: false, // 🔐 do not return password by default
    },
    phoneNumber: { type: String, unique: true },
    whatsApp: { type: String },
    nid: { type: String },
    passport: { type: String },

    // Social Media
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    youtubeLink: { type: String },

    youtubeVideos: [{ type: String }],

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

    actorReference: [
      {
        actorId: { type: Schema.Types.ObjectId, ref: "Actor", required: true },
        name: { type: String },
        idNo: { type: String },
      },
    ],

    coverImages: [{ type: String }],

    idNo: { type: String, unique: true },
    rank: { type: String },
    occupation: { type: String },
    actorName: { type: String },
    otherName: { type: String },
    spouse: { type: String },
    bio: { type: String, default: "" },

    fromActive: { type: String },
    endActive: { type: String, default: null },
    presentActive: { type: String, default: null },

    height: { type: String },
    weight: { type: String },

    workExperience: { type: String },
    workSocialMediaInfo: { type: String },
    educationInfo: { type: String },
    personalInfo: { type: String },
    basicInfo: { type: String },

    rankYearRange: {
      yearRange: { type: String },
      start: { type: Number },
      end: { type: Number },
    },
    rankYear: { type: String },

    profilePhoto: [
      {
        left: { type: String },
        right: { type: String },
        front: { type: String },
      },
    ],

    photo: { type: String, default: "https://res.cloudinary.com/dk4ltobvb/image/upload/v1766485148/Actors.png.png" },
    characterPhoto: [{ type: String }],

    introVideo: {
      url: { type: String },
      duration: { type: Number, max: 30 },
      sizeMB: { type: Number, max: 100 },
    },

    category: { type: String, enum: ["A", "B", "C"] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

/* ======================================================
   🔐 PASSWORD HASHING (PRE SAVE)
====================================================== */
actorSchema.pre<IActor>("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ======================================================
   🔐 PASSWORD COMPARE METHOD
====================================================== */
actorSchema.methods.comparePassword = async function (
  plainPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.password);
};

const Actor = mongoose.model<IActor>("Actor", actorSchema);
export default Actor;
