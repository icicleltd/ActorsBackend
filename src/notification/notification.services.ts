import mongoose, { Types } from "mongoose";
import { AppError } from "../middleware/error";
import {
  IFetchNotification,
  INotificationQuery,
  NotificationType,
} from "./notification.interface";
import { Notification } from "./notification.schema";

const createNotification = async () => {
  return {
    msg: "Notification created",
  };
};
const BE_A_MEMBER_TYPES = [
  "BE_A_MEMBER",
  "PAYMENT_SUBMITTED",
  "APPLICATION_APPROVED",
  "APPLICATION_REJECTED",
];
const getNotification = async (queryPayload: IFetchNotification) => {
  const {
    role,
    recipient,
    notificationType,
    limit,
    search,
    skip,
    sortBy,
    sortWith,
  } = queryPayload;
  if (!role) {
    throw new AppError(400, "Role is required");
  }
  const filter: Partial<Record<string, unknown>> = {};

  if (role === "member") {
    if (!recipient) {
      throw new AppError(400, "Recipient is required");
    }

    const notifications = await Notification.aggregate([
      // 1️⃣ Only notifications for this actor
      {
        $match: {
          recipient: new mongoose.Types.ObjectId(recipient),
          type: "REFERENCE_REQUEST",
        },
      },

      // 2️⃣ Join application
      {
        $lookup: {
          from: "beamembers",
          localField: "application",
          foreignField: "_id",
          as: "application",
        },
      },
      { $unwind: "$application" },

      // 3️⃣ Extract ONLY my reference
      {
        $addFields: {
          myReference: {
            $first: {
              $filter: {
                input: "$application.actorReference",
                as: "ref",
                cond: {
                  $eq: [
                    "$$ref.actorId",
                    new mongoose.Types.ObjectId(recipient),
                  ],
                },
              },
            },
          },
        },
      },

      // 4️⃣ Shape response
      {
        $project: {
          title: 1,
          message: 1,
          type: 1,
          isRead: 1,
          createdAt: 1,

          "application._id": 1,
          "application.fullName": 1,
          "application.phoneNumber": 1,
          "application.email": 1,
          "application.actorReference.actorId": 1,

          myReferenceStatus: "$myReference.status",
          respondedAt: "$myReference.respondedAt",
        },
      },

      // 5️⃣ Sorting & pagination
      { $sort: { [sortBy]: sortWith } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalPages = Math.ceil(notifications.length / limit);
    return { notifications, totalPages };
  }

  // 🔹 Admin / Superadmin inbox
  if (role === "admin" || role === "superadmin") {
    filter.recipientRole = { $in: ["admin", "superadmin"] };

    // 👉 BE_A_MEMBER means group filter
    if (notificationType === "BE_A_MEMBER") {
      // filter.type = { $in: BE_A_MEMBER_TYPES };
      filter.type = notificationType;
    }

    // 👉 Specific single notification
    else if (notificationType && notificationType !== "ALL") {
      filter.type = notificationType;
    }
  }

  const notifications = await Notification.find(filter)
    .populate({
      path: "application",
      populate: {
        path: "actorReference.actorId",
        model: "Actor",
      },
    })
    .populate({
      path: "payment",
    })
    .populate({
      path: "recipient",
    })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortWith })
    .lean();

  const totalPages = Math.ceil(notifications.length / limit);
  return { notifications, totalPages };
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

const readNotification = async (
  notificationType: NotificationType,
  id: string,
) => {
  if (!id) {
    throw new AppError(400, "Notification id is required");
  }
  // if (
  //   notificationType === "BE_A_MEMBER" &&
  //   (role === "admin" || role === "superadmin")
  // ) {
  //   await Notification.updateMany(
  //     {
  //       type: "APPLICATION_SUBMITTED",
  //       recipientRole: { $in: ["admin", "superadmin"] },
  //       isRead: false,
  //     },
  //     {
  //       $set: { isRead: true },
  //     },
  //   );

  //   return { success: true, bulkRead: true };
  // }

  // RULE 2: Member reading REFERENCE_REQUEST
  if (notificationType === "REFERENCE_REQUEST") {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      throw new AppError(404, "REFERENCE_REQUEST Notification not found");
    }

    return notification;
  }

  // DEFAULT: single notification read
  const notification = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }

  return notification;
};

const unReadCountNotification = async (queryPayload: INotificationQuery) => {
  const { role, recipient, _id } = queryPayload;
  if (!role) {
    throw new AppError(400, "Role is required");
  }
  if (role === "member") {
    if (!recipient) {
      throw new AppError(400, "recipient id is required");
    }
    const referace = await Notification.countDocuments({
      type: "REFERENCE_REQUEST",
      recipient: recipient,
      recipientRole: role,
      isRead: false,
    });
    return { REFERENCE_REQUEST: referace };
  }
  const [all, contact, referace, payment, approved, submit] = await Promise.all(
    [
      Notification.countDocuments({
        isRead: false,
      }),
      Notification.countDocuments({
        type: "CONTACT",
        isRead: false,
      }),
      Notification.countDocuments({
        type: "REFERENCE_REQUEST",
        isRead: false,
      }),
      Notification.countDocuments({
        type: "PAYMENT_SUBMITTED",
        isRead: false,
      }),
      Notification.countDocuments({
        type: "APPLICATION_APPROVED",
        isRead: false,
      }),
      Notification.countDocuments({
        type: "BE_A_MEMBER",
        isRead: false,
      }),
    ],
  );

  const adminNotification = submit + payment + contact;
  return {
    ALL: all,
    BE_A_MEMBER: submit,
    ADMIN_NOTIFICATION: adminNotification,
    PAYMENT_SUBMITTED: payment,
    REFERENCE_REQUEST: referace,
    APPLICATION_APPROVED: approved,
    CONTACT: contact,
  };
};
const unReadNotification = async (queryPayload: INotificationQuery) => {
  const { role, recipient, _id } = queryPayload;
  if (!role) {
    throw new AppError(400, "Role is required");
  }
  if (role === "member") {
    if (!recipient) {
      throw new AppError(400, "recipient id is required");
    }

    if (!recipient.equals(_id)) {
      throw new AppError(400, "recipient id not match");
    }
    const reference = await Notification.find({
      type: "REFERENCE_REQUEST",
      recipient: recipient,
      recipientRole: role,
      isRead: false,
    });
    return { notifications: reference };
  }
  const [all, contact, reference, payment, approved, submit, admin] =
    await Promise.all([
      Notification.find({
        isRead: false,
      }),
      Notification.find({
        type: "CONTACT",
        isRead: false,
      }),
      Notification.find({
        type: "REFERENCE_REQUEST",
        isRead: false,
      }),
      Notification.find({
        type: "PAYMENT_SUBMITTED",
        isRead: false,
      }),
      Notification.find({
        type: "APPLICATION_APPROVED",
        isRead: false,
      }),
      Notification.find({
        type: "BE_A_MEMBER",
        isRead: false,
      }),
      Notification.find({
        type: { $in: BE_A_MEMBER_TYPES },
        isRead:false
      }),
    ]);
  const adminNotification = { submit, payment, approved, contact };
  return {
    // ALL: all,
    // BE_A_MEMBER: submit,
    notifications: admin,
    // PAYMENT_SUBMITTED: payment,
    // REFERENCE_REQUEST: reference,
    // APPLICATION_APPROVED: approved,
    // CONTACT: contact,
  };
};

export const NotificationService = {
  createNotification,
  getNotification,
  getAdminNotification,
  readNotification,
  unReadCountNotification,
  unReadNotification,
};
