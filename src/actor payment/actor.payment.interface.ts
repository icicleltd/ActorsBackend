import mongoose, { Types } from "mongoose";

export interface IActorPayment {
  actor: mongoose.Types.ObjectId;
  notifyPayment: mongoose.Types.ObjectId;
  type: "membership" | "event";
  year?: number;
  eventId?: Types.ObjectId;
  amount: number;
  desc?: string;
  method: "bkash" | "Nagad" | "Cash" | "bank";
  recordedVia: "direct" | "notify";

  status: "pending" | "verified" | "rejected";
  transactionId?: string;
  number?: string;
  date?: Date;
  accountNo?: string;
  bankName?: string;

  verifiedBy: mongoose.Types.ObjectId;
  verifiedAt: Date;

  note?: string;
}

export interface INotifyPayment {
  actorId: Types.ObjectId;
  type: "membership" | "event";
  eventId?: Types.ObjectId;
  amount: number;
  desc?: string;
  year?: number;
  isView: boolean;
  status: "request" | "paid" | "rejected";
  method?: "bkash" | "Nagad" | "Cash" | "bank";
  rejectionReason?: string;
  transactionId?: string;
  number?: string;
  date?: Date;
  accountNo?: string;
  bankName?: string;
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
