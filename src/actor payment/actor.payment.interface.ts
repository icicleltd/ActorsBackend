import mongoose, { Types } from "mongoose";

export interface IActorPayment {
  actor: mongoose.Types.ObjectId;
  notifyPayment: mongoose.Types.ObjectId;
  type: "membership" | "event";
  year?: string;
  eventName?: string;
  number: string;
  amount: number;
  desc?: string;
  method: "bkash" | "Nagad" | "Cash";
  transactionId?: string;

  status: "pending" | "verified" | "rejected";

  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;

  note?: string;
}

export interface INotifyPayment {
  actorId: Types.ObjectId;
  amount: number;
  number: string;
  desc?: string;
  year?: string;
  isView: boolean;
  status: "request" | "paid";
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
