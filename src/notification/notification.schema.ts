import { model, Schema } from "mongoose";
import { INotification } from "./notification.interface";
import { NOTIFICATION_TYPES, RECIPIENT_ROLES } from "./notification.constant";

const notificationSchema = new Schema<INotification>(
  {
    recipientRole: {
      type: [String],
      enum: RECIPIENT_ROLES,
      required: true,
    },

    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: false,
    },
    schedule: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: false,
    },

    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    application: {
      type: Schema.Types.ObjectId,
      ref: "BeAMember",
      required: false,
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
