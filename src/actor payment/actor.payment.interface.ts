import mongoose, { Types } from "mongoose";

export interface IActorPayment {
  actor: mongoose.Types.ObjectId;
  notifyPayment: mongoose.Types.ObjectId;
  type: "membership" | "event";
  year?: number;
  eventId?: Types.ObjectId;
  number: string;
  amount: number;
  desc?: string;
  method: "bkash" | "Nagad" | "Cash";
  recordedVia: "direct" | "notify";
  transactionId?: string;

  status: "pending" | "verified" | "rejected";

  verifiedBy: mongoose.Types.ObjectId;
  verifiedAt: Date;

  note?: string;
}

export interface INotifyPayment {
  actorId: Types.ObjectId;
  type: "membership" | "event";
  eventId?: Types.ObjectId;
  transactionId?: string;
  amount: number;
  number: string;
  desc?: string;
  year?: number;
  isView: boolean;
  status: "request" | "paid" | "rejected";
  method?: "bkash" | "Nagad" | "Cash";
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotifyActorPayload {
  fee: string;
  year: string;
  desc: string;
  number: string;
  actorId: string[];
}
