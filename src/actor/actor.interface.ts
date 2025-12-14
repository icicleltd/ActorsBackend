import type { Document, Types } from "mongoose";

export interface IActor extends Document {
  // =========================
  // Required
  // =========================
  fullName: string;

  // =========================
  // Basic Info
  // =========================
  motherName?: string;
  fatherName?: string;
  birthPlace?: string;
  presentAddress?: string;
  permanentAddress?: string;
  nationality?: string;
  religion?: string;
  dob?: string;
  bloodGroup?: string;

  // =========================
  // Contact
  // =========================
  email?: string;
  phoneNumber?: string;
  whatsApp?: string;
  nid?: string;
  passport?: string;
  rankYear?: string;
  rankYearRange?: {
    yearRange?: { type: String };
    start?: { type: Number };
    end?: { type: Number };
  };

  // =========================
  // Social Media
  // =========================
  facebookLink?: string;
  instagramLink?: string;
  tiktokLink?: string;
  youtubeLink?: string; // main profile link

  // =========================
  // YouTube Videos
  // =========================
  youtubeVideos?: string[];

  // =========================
  // Drama / Film Acted Details
  // =========================
  actedDramaAndFilmDetails?: {
    filmAndDramaName?: string;
    characterName?: string;
    directorName?: string;
    broadcastMedium?: string;
  }[];

  // =========================
  // Education & Skills
  // =========================
  educationQualification?: string;
  emergencyNumber?: string;
  stageAndFilmAdditionalSkills?: string;

  // =========================
  // Actor Reference
  // =========================
  actorReference?: {
    actorId: Types.ObjectId;
    name?: string;
    idNo?: string;
  }[];

  // =========================
  // Admin Added Member Info
  // =========================
  idNo?: string;
  rank?: string;
  occupation?: string;
  actorName?: string;
  otherName?: string;
  spouse?: string;
  bio?: string;

  fromActive?: string;
  endActive?: string | null;
  presentActive?: string | null;

  // =========================
  // Physical Info
  // =========================
  height?: string;
  weight?: string;

  // =========================
  // Work / Personal Info
  // =========================
  workExperience?: string;
  workSocialMediaInfo?: string;
  educationInfo?: string;
  personalInfo?: string;
  basicInfo?: string;

  // =========================
  // Photos
  // =========================
  profilePhoto?: {
    left?: string;
    right?: string;
    front?: string;
  }[];

  photo?: string;
  characterPhoto?: string[];

  // =========================
  // Intro Video
  // =========================
  introVideo?: {
    url?: string;
    duration?: number; // max 30 seconds
    sizeMB?: number; // max 100 MB
  };

  // =========================
  // Category & Status
  // =========================
  category?: "A" | "B";
  status: "pending" | "approved" | "rejected";

  // =========================
  // Timestamps (from schema)
  // =========================
  createdAt?: Date;
  updatedAt?: Date;
}
