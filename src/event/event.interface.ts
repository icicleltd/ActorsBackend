import { Types } from "mongoose";

export interface IEvent {
  title: string;
  description: string;

  // Media
  logo?: string;
  banner?: string;
  images?: string[];

  name: string;
  details: string;

  // Date
  eventDate: Date;

  // Booking
  isBookingOpen: boolean;

  // Registration count only
  registrationCount: number;

  // Admin creator
  createdBy: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateEventDto {
  title: string;
  name: string;
  details?: string;
  description: string;
  eventDate: Date;
  isBookingOpen: boolean;
}
