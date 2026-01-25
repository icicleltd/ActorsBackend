import { Types } from "mongoose";

export interface IActedDramaAndFilmDetail {
  filmAndDramaName: string;
  characterName: string;
  directorName: string;
  broadcastMedium: string;
}

export interface IActorReference {
  actorId: Types.ObjectId;
  name?: string;
  idNo?: string;
  status: "pending" | "approved" | "rejected";
  respondedAt: Date;
}

export interface IBeAMember {
  // Required
  fullName: string;

  // Basic Info
  motherName: string;
  professionalName?: string;
  fatherName: string;
  birthPlace: string;
  presentAddress: string;
  permanentAddress: string;
  nationality: string;
  religion: string;
  dob: Date;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

  // Contact
  email: string;
  phoneNumber: string;
  whatsApp: string;
  nid: string;
  passport?: string;

  // Social Media
  facebookLink?: string;
  instagramLink?: string;
  tiktokLink?: string;
  youtubeLink?: string;

  youtubeVideos?: string[];

  // Acted Works (min 10 enforced in schema)
  actedDramaAndFilmDetails: IActedDramaAndFilmDetail[];

  educationQualification: string;
  emergencyNumber: string;
  stageAndFilmAdditionalSkills: string;

  actorReference?: IActorReference[];

  height?: string;
  weight?: string;
  payment: Types.ObjectId;

  status: "pending" | "approved" | "rejected";
  seq: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBeAMemberPayload {
  fullName: string;
  professionalName?: string;
  motherName: string;
  fatherName: string;
  birthPlace: string;
  presentAddress: string;
  permanentAddress: string;
  nationality: string;
  religion: string;

  dob: string; // comes as string
  bloodGroup: string;

  email: string;
  phoneNumber: string;
  whatsApp: string;
  nid: string;
  passport?: string;

  facebookLink?: string;
  instagramLink?: string;
  tiktokLink?: string;
  youtubeLink?: string;

  educationQualification: string;
  emergencyNumber: string;
  stageAndFilmAdditionalSkills: string;

  actedDramaAndFilmDetails: IActedDramaAndFilmDetail[];
  amount: number;
  actorReference: {
    actorId: Types.ObjectId; // ObjectId as string
    name?: string;
    idNo?: string;
  }[];
  seq: number;
  bkashNumber: string;
  transactionId: string;
}
