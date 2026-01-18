import { Schema, model, Types } from "mongoose";

export type NotificationType =
  | "APPLICATION_SUBMITTED"
  | "PAYMENT_SUBMITTED"
  | "REFERENCE_REQUEST"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "CONTACT";

export type RecipientRole = "admin" | "member" | "superadmin";

export interface INotification {
  recipientRole: RecipientRole[];

  // Who will receive this
  recipient?: Types.ObjectId; // actorId (null for admin broadcast)

  type: NotificationType;

  title: string;
  message: string;

  // Context references
  application: Types.ObjectId;
  payment?: Types.ObjectId;

  isRead: boolean;
}
