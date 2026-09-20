// receipt.interface.ts
import { Types } from "mongoose";

export interface IReceipt {
  _id?: Types.ObjectId;
  receiptNo: string;              // auto-generated, e.g. "RCPT-2026-0001"
  title: string;                  // "Membership fee"
  actorId: Types.ObjectId;        // ref to the member/actor being billed
  name: string;                   // snapshot of actorInfo.fullName at time of billing
  idNo: string;                   // snapshot of actorInfo.idNo
  totalAmount: number;
  amountInWord: string;
  allYear: number[];              // years this payment covers
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;    // ref to User who verified
  createdAt?: Date;
  updatedAt?: Date;
}

// Payload for creating a receipt (before verification happens)
export type TCreateReceiptPayload = Omit<
  IReceipt,
  "_id" | "receiptNo" | "createdAt" | "updatedAt"
>;