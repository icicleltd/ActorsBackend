import type { Document, Types } from "mongoose";
export interface IImage {
  url: string;
}

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
  dob?: Date;
  bloodGroup?: string;

  // =========================
  // Contact
  // =========================
  email?: string;
  password?: string;
  comparePassword(plainPassword: string): Promise<boolean>;
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
  youtubeLink?: string;
  twitterLink?: string;

  // =========================
  // YouTube Videos
  // =========================
  youtubeVideos?: string[];
  mediaArchives?: { link: string; title?: string }[];

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
  rankHistory?: [
    {
      rank: String;
      yearRange: String;
      start: Number;
      end: Number;
    },
  ];
  // entiry?: {
  //   rank: String;
  //   yearRange: String;
  //   start: Number;
  //   end: Number;
  // };
  occupation?: string;
  actorName?: string;
  otherName?: string;
  spouse?: string;
  bio?: string;

  fromActive?: string;
  endActive?: string | null;
  presentActive?: string | null;
  role: "member" | "admin";

  // =========================
  // Physical Info
  // =========================
  height?: {
    feet?: number;
    inches?: number;
  };
  // experienceYears?: number;
  weight?: string;
  drama?: number;
  serial?: number;
  film?: number;
  award?: number;
  isProfilePublic: boolean;
  isActive: boolean;

  // =========================
  // Work / Personal Info
  // =========================
  workExperience?: number;
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

  gallery: {
    image: string;
    publicId: string;
  }[];

  photo?: string;
  characterPhoto?: string[];
  heightFeet?: string;
  heightInch?: string;

  performanceInfo?: [
    {
      caption: string;
      url: string;
    },
  ];
  news?: [
    {
      title: string;
      link: string;
      image: string;
      details: string;
      published: Date;
      category: string;
    },
  ];

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
  // status: "pending" | "approved" | "rejected";
  coverImages?: IImage[];
  activity?: {
    all?: string[];
    drama?: string[];
    tv?: string[];
    series?: string[];
    tvc?: string[];
    movies?: string[];
    telefilms?: string[];
  };

  // =========================
  // Timestamps (from schema)
  // =========================
  createdAt?: Date;
  updatedAt?: Date;
}

export type AllowedActorPayload = Pick<
  IActor,
  | "phoneNumber"
  | "email"
  | "password"
  | "dob"
  | "photo"
  | "fullName"
  | "bloodGroup"
  | "bio"
  | "presentAddress"
>;

export type ActorPayloadForProfileUpdate = Pick<
  IActor,
  | "birthPlace"
  | "workExperience"
  | "bloodGroup"
  | "heightInch"
  | "heightFeet"
  | "weight"
  | "dob"
  | "bio"
  | "drama"
  | "serial"
  | "film"
  | "award"
  | "facebookLink"
  | "instagramLink"
  | "twitterLink"
  | "tiktokLink"
  | "youtubeLink"
>;
export type ActorPayloadForPerformance = Pick<IActor, "performanceInfo">;
export type ActorPayloadForNews = Pick<IActor, "news">;
export type ActorPayloadForMediaArchives = Pick<IActor, "mediaArchives">;
