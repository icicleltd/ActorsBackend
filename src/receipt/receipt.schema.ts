// receipt.model.ts
import { Schema, model, Types } from "mongoose";
import { IReceipt } from "./receipt.interface";

const receiptSchema = new Schema<IReceipt>(
  {
    receiptNo: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, required: true, ref: "Actor" },
    name: { type: String, required: true },
    idNo: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    amountInWord: { type: String, required: true },
    allYear: { type: [Number], required: true },
    verifiedAt: { type: Date, default: undefined },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
  },
  { timestamps: true }
);

receiptSchema.index({ actorId: 1, createdAt: -1 });

export const Receipt = model<IReceipt>("Receipt", receiptSchema);