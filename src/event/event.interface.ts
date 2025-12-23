import { Types } from "mongoose";

export interface IEvent {
  title: string;
  description: string;

  // Media
  logo?: string;
  banner?: string;
  images?: string[];

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
