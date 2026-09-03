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
      required: function (this: any) {
        return this.method !== "Cash";
      },
    },

    type: {
      type: String,
      enum: ["membership", "event"],
      default: "membership",
      required: true,
    },

    year: {
      type: Number,
      required: function (this: any) {
        return this.type === "membership";
      },
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: function (this: any) {
        return this.type === "event";
      },
    },
    number: {
      type: String,
      required: function (this: any) {
        return this.method !== "Cash";
      },
    },
    desc: {
      type: String,
      trim: true,
    },

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
      default: "verified",
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    verifiedAt: { type: Date, required: true, default: Date.now },

    note: String,
  },
  { timestamps: true },
);

// Prevent duplicate yearly membership payment
actorPaymentSchema.index(
  { actor: 1, type: 1, year: 1 },
  { unique: true, partialFilterExpression: { type: "membership" } },
);
actorPaymentSchema.index(
  { actor: 1, type: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { type: "event" } },
);
actorPaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

const ActorPayment = model<IActorPayment>("ActorPayment", actorPaymentSchema);

export default ActorPayment;

const NotifyPaymentSchema = new Schema<INotifyPayment>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
      required: true,
    },
    type: {
      type: String,
      enum: ["membership", "event"],
      default: "membership",
      required: true,
    },
    year: {
      type: Number,
      required: function (this: any) {
        return (this.type = "membership");
      },
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: function (this: any) {
        return this.type === "event";
      },
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
    desc: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["request", "paid"],
      default: "request",
    },
    rejectionReason: { type: String, trim: true },

    isView: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Block duplicate PENDING requests for the same membership year
NotifyPaymentSchema.index(
  { actorId: 1, type: 1, year: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "membership", status: "request" },
  },
);
// Block duplicate PENDING requests for the same event
NotifyPaymentSchema.index(
  { actorId: 1, type: 1, eventId: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "event", status: "request" },
  },
);

export const NotifyPayment = model<INotifyPayment>(
  "NotifyPayment",
  NotifyPaymentSchema,
);
