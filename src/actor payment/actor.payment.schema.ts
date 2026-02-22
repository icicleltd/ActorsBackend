import { Schema, model } from "mongoose";
import { IActorPayment, INotifyPayment } from "./actor.payment.interface";

const actorPaymentSchema = new Schema<IActorPayment>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
      required: true,
      index: true,
    },
    notifyPayment: {
      type: Schema.Types.ObjectId,
      ref: "NotifyPayment",
      required: true,
    },

    type: {
      type: String,
      enum: ["membership", "event"],
      default: "membership",
      required: true,
    },

    year: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
     desc: {
      type: String,
      trim: true,
    },

    eventName: String,

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["bkash", "Nagad", "Cash"],
      default: "bkash",
      required: true,
    },

    transactionId: String,

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },

    verifiedAt: Date,

    note: String,
  },
  { timestamps: true },
);

// Prevent duplicate yearly membership payment
actorPaymentSchema.index(
  { actor: 1, type: 1, year: 1 },
  { unique: true, partialFilterExpression: { type: "membership" } },
);

const ActorPayment = model<IActorPayment>("ActorPayment", actorPaymentSchema);

export default ActorPayment;

const NotifyPaymentSchema = new Schema<INotifyPayment>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    number: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["request", "paid"],
      default: "request",
    },

    desc: {
      type: String,
      trim: true,
    },

    isView: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const NotifyPayment = model<INotifyPayment>(
  "NotifyPayment",
  NotifyPaymentSchema,
);
