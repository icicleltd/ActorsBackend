import { Schema, model } from "mongoose";
import { IPayment } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    // Link payment to application (NOT user)
    beAMember: {
      type: Schema.Types.ObjectId,
      ref: "BeAMember",
      required: true,
      unique: true,
    },

    method: {
      type: String,
      enum: ["bkash"],
      default: "bkash",
    },

    // Applicant’s bKash number
    senderNumber: {
      type: String,
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: String,
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("Payment", paymentSchema);
