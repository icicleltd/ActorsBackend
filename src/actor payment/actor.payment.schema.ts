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
        return this.source === "notify";
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
      trim: true,
      required: function (this: any) {
        return this.method == "bkash";
      },
    },
    transactionId: {
      type: String,
      trim: true,
      required: function (this: any) {
        return this.method == "bkash";
      },
    },
    accountNo: {
      type: String,
      trim: true,
      required: function (this: any) {
        return this.method == "bank";
      },
    },
    bankName: {
      type: String,
      trim: true,
      required: function (this: any) {
        return this.method == "bank";
      },
    },
    date: {
      type: Date,
      required: function (this: any) {
        return this.method == "bank";
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
      enum: ["bkash", "Nagad", "Cash", "bank"],
      default: "Cash",
      required: true,
    },
    recordedVia: {
      type: String,
      enum: ["notify", "direct"],
      default: "direct",
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
      required: function (this: any) {
        return this.status === "verified" || this.status === "rejected";
      },
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

    amount: {
      type: Number,
      required: true,
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
    method: {
      type: String,
      enum: ["bkash", "Nagad", "Cash","bank"],
      required: function (this: any) {
        return this.status === "paid";
      },
    },
    number: {
      type: String,
      trim: true,
      required: function (this: any) {
        return this.method == "bkash";
      },
    },
    transactionId: {
      type: String,
      trim: true,
      required: function (this: any) {
        return this.method == "bkash";
      },
    },
    accountNo: {
      type: String,
      trim: true,
      required: function (this: any) {
        return this.method == "bank";
      },
    },
    bankName: {
      type: String,
      trim: true,
      required: function (this: any) {
        return this.method == "bank";
      },
    },
    date: {
      type: Date,
      required: function (this: any) {
        return this.method == "bank";
      },
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
