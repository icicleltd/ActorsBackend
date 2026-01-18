import { Types } from "mongoose";

export type PaymentMethod = "bkash";
export type PaymentStatus = "pending" | "verified" | "rejected";

export interface IPayment {
  // 🔗 Linked application (no login required)
  beAMember: Types.ObjectId;

  method: PaymentMethod;

  senderNumber: string;

  transactionId: string;

  amount: number;

  status: PaymentStatus;

  // 👮 Admin verification
  verifiedBy?: Types.ObjectId | null;
  verifiedAt?: Date | null;

  rejectionReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentPayload {
  senderNumber: string;
  transactionId: string;
  amount: number;
}
