import { Document, Types } from "mongoose";

export interface INotification extends Document {
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  type: string;
  reference?: string | null;
  isRead: boolean;
  title: string;
}