import mongoose, { model, Schema } from "mongoose";
import { INotification } from "./notification.interface";

const NotificationSchema = new Schema<INotification>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: { type: String, required: true, index: true },

    reference: { type: String, default: null }, // could be an ID or URL

    isRead: { type: Boolean, default: false, index: true },

    title: { type: String, required: true },
  },
  { timestamps: true }
);
const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;