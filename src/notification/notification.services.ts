import { AppError } from "../middleware/error";
import { INotificationQuery } from "./notification.interface";
import { Notification } from "./notification.schema";


const createNotification = async () => {
  return {
    msg: "Notification created",
  };
};
const getNotification = async (queryPayload: INotificationQuery) => {
  const { recipientRole, recipient, notificationType } = queryPayload;

  const filter: Partial<Record<string, unknown>> = {};

  if (recipientRole === "member") {
    if (!recipient) {
      throw new AppError(400, "Recipient is required for member notifications");
    }
    filter.recipient = recipient;
  }

  if (recipientRole === "admin" || recipientRole === "superadmin") {
    filter.recipientRole = { $in: ["admin", "superadmin"] };
  }

  if (notificationType && notificationType !== "ALL") {
    filter.type = notificationType;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  console.log("notifications", notifications.length);
  return notifications;
};
const getAdminNotification = async (adminId: string) => {
  if (!adminId) {
    throw new AppError(400, "No admin id provided");
  }
  const notification = await Notification.find({
    recipientId: adminId,
  });
  if (!notification) {
    throw new AppError(404, "No notifications found for this admin");
  }
  return notification;
};
const readNotification = async (notificatinId: string) => {
  if (!notificatinId) {
    throw new AppError(400, "No notification id provided");
  }
  const notification = await Notification.findByIdAndUpdate(
    notificatinId,
    {
      isRead: true,
    },
    { new: true },
  );
  if (!notification) {
    throw new AppError(404, "Notification not found");
  }
  return notification;
};

export const NotificationService = {
  createNotification,
  getNotification,
  getAdminNotification,
  readNotification,
};
