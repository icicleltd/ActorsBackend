import { Types } from "mongoose";
export type MediaDirectoryType =
  | "producer"
  | "director"
  | "script_writer"
  | "dop"
  | "makeup_artist"
  | "shooting_house"
  | "tv_channel"
  | "finance_and_contract";

export interface IMediaDirectory {
  houseName?: string;
  fullName?: string;

  phone: string;
  email?: string;
  mediaRole: MediaDirectoryType;

  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export interface CreateEventDto {
  title: string;
  description: string;
  eventDate: Date;
  isBookingOpen: boolean;
}
export interface ICreateMediaDirectory {
  houseName?: string;
  fullName?: string;

  phone?: string;
  email?: string;
  mediaRole: MediaDirectoryType;
}

export type AllowedMediaDirectoryFields = Partial<
  Pick<IMediaDirectory, "fullName" | "houseName" | "phone" | "email">
>;
