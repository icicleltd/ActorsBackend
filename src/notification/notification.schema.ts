import { model, Schema } from "mongoose";
import { INotification } from "./notification.interface";

const notificationSchema = new Schema<INotification>(
  {
    recipientRole: {
      type: [String],
      enum: ["admin", "member", "superadmin"],
      required: true,
    },

    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
    },

    type: {
      type: String,
      enum: [
        "APPLICATION_SUBMITTED",
        "PAYMENT_SUBMITTED",
        "REFERENCE_REQUEST",
        "APPLICATION_APPROVED",
        "APPLICATION_REJECTED",
        "CONTACT",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    application: {
      type: Schema.Types.ObjectId,
      ref: "BeAMember",
      required: true,
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Index for fast inbox
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1 });

export const Notification = model<INotification>(
  "Notification",
  notificationSchema,
);
