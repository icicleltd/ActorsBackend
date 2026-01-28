import { Types } from "mongoose";
import { NOTIFICATION_TYPES, RECIPIENT_ROLES } from "./notification.constant";

/* =======================
   DERIVED TYPES
======================= */

export type RecipientRole = (typeof RECIPIENT_ROLES)[number];

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/* =======================
   MAIN DOCUMENT TYPE
======================= */

export interface INotification {
  recipientRole: RecipientRole[];

  // Actor _id (undefined for admin/superadmin broadcast)
  recipient?: Types.ObjectId;

  type: NotificationType;

  title: string;
  message: string;

  application: Types.ObjectId;
  payment?: Types.ObjectId;

  isRead: boolean;
}

/* =======================
   QUERY TYPE
======================= */

export interface INotificationQuery {
  role: RecipientRole;
  recipient?: Types.ObjectId;
  notificationType?: NotificationType;
  _id:Types.ObjectId
}
export interface IFetchNotification {
   role: RecipientRole;
  recipient?: Types.ObjectId;
  notificationType?: NotificationType;
  page: number;
  limit: number;
  skip: number;
  search: string;
  sortBy: string;
  sortWith: 1 | -1;
}
