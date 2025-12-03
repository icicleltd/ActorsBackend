import type { Document } from "mongoose";

export interface IActor extends Document {
  fullName: string; // REQUIRED

  idNo?: string;
  rank?: string;
  motherName?: string;
  fatherName?: string;
  presentAddress?: string;
  dob?:  string;
  bloodGroup?: string;
  occupation?: string;

  email?: string;
  phoneNumber?: string;
  NID?: string;
  passport?: string;

  actorName?: string;
  otherName?: string;
  spouse?: string;

  bio?: string[];

  fromActive?: string;
  endActive?: string | null;
  presentActive?: string | null;

  facebookLink?: string;
  instagramLink?: string;
  tiktokLink?: string;

  height?: string;
  weight?: string;

  workExperience?: string;
  workSocialMediaInfo?: string;
  educationInfo?: string;
  personalInfo?: string;
  basicInfo?: string;

  profilePhoto?: {
    left?: string;
    right?: string;
    front?: string;
  }[];

  characterPhoto?: string[];
  youtubeLink?: string[];
  category?: "A" | "b";
  status: "pending" | "approved" | "rejected";

  introVideo?: {
    url?: string;
    duration?: number; // seconds (max 30)
    sizeMB?: number; // file size MB (max 100)
  };
}
