import mongoose, { Types } from "mongoose";
import Actor from "../actor/actor.schema";
import { AppError } from "../middleware/error";
import { INotifyActorPayload, INotifyPayment } from "./actor.payment.interface";
import { Notification } from "../notification/notification.schema";
import ActorPayment, { NotifyPayment } from "./actor.payment.schema";
import { INotification } from "../notification/notification.interface";
import { Payment } from "../payment/payment.schema";

type PaymentStatus = "paid" | "pending";

const actorPaymentInfo = async (
  id: string,
  search: string,
  limit: number,
  sortBy: string,
  sortWith: 1 | -1,
  alive: string,
  year: number,
  status?: "paid" | "pending",
) => {
  if (!year) {
    throw new AppError(400, "Year is required");
  }

  const matchFilter: any = {};

  // Exclude specific actor
  if (id) {
    matchFilter._id = { $nin: [new Types.ObjectId(id)] };
  }

  // Alive filter
  if (alive?.trim() === "alive") {
    matchFilter["rankHistory.rank"] = { $nin: ["pastWay"] };
  }

  // Search filter
  if (search?.trim()) {
    const value = search.trim();
    matchFilter.$or = [
      { fullName: { $regex: `^${value}`, $options: "i" } },
      { email: { $regex: `^${value}`, $options: "i" } },
      { idNo: { $regex: `^${value}`, $options: "i" } },
      { phoneNumber: { $regex: `^${value}`, $options: "i" } },
    ];
  }

  // Aggregation pipeline
  const pipeline: any[] = [
    { $match: matchFilter },

    {
      $lookup: {
        from: "actorpayments",
        let: { actorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$actor", "$$actorId"] },
                  { $eq: ["$year", String(year)] },
                ],
              },
            },
          },
        ],
        as: "payments",
      },
    },

    {
      $addFields: {
        paid: { $gt: [{ $size: "$payments" }, 0] },
        amount: { $arrayElemAt: ["$payments.amount", 0] },
      },
    },
  ];

  // Status filtering
  if (status === "paid") {
    pipeline.push({ $match: { paid: true } });
  }

  if (status === "pending") {
    pipeline.push({ $match: { paid: false } });
  }

  // Final projection + sorting + limit
  pipeline.push(
    {
      $project: {
        fullName: 1,
        idNo: 1,
        dob: 1,
        paid: 1,
        amount: 1,
      },
    },
    { $sort: { [sortBy]: sortWith } },
    { $limit: limit },
  );

  const actors = await Actor.aggregate(pipeline);
  return { actors };
};

const notifyActorForPayment = async (payload: INotifyActorPayload) => {
  const { fee, actorId, desc, number, year } = payload;
  if (!fee || isNaN(Number(fee))) {
    throw new AppError(400, "Valid fee is required");
  }
  if (!desc) {
    throw new AppError(400, "desc is required");
  }
  if (!number) {
    throw new AppError(400, "number is required");
  }
  if (!year) {
    throw new AppError(400, "year is required");
  }

  if (!actorId || actorId.length < 1) {
    throw new AppError(400, "Select which actor you want to notify");
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const amount = Number(fee);
      const existing = await NotifyPayment.find({
        actorId: { $in: actorId },
        year,
        number,
        amount,
      }).session(session);

      if (existing.length > 0) {
        throw new AppError(
          400,
          `Some actors already notified for year ${year}`,
        );
      }
      const notifyPaymentData = actorId.map((id) => ({
        actorId: id,
        amount,
        number,
        desc,
        year,
      }));
      const notifyPayments = await NotifyPayment.insertMany(notifyPaymentData, {
        session,
      });

      if (!notifyPayments || notifyPayments.length < 1) {
        throw new AppError(400, "Failed to create notify payment");
      }
      const notificationData = notifyPayments.map((notify) => ({
        recipientRole: ["member"],
        recipient: notify.actorId,
        type: "NOTIFY_PAYMENT",
        title: "Payment Notification",
        message: `You have been notified to pay ৳${amount} in ${year || ""}. ${desc || ""}`,
        notifyPayment: notify._id,
        isRead: false,
      }));
      console.log(notificationData, notifyPayments);
      const notifications = await Notification.insertMany(notificationData, {
        session,
      });
      if (!notifications || notifications.length < 1) {
        throw new AppError(400, "Failed to create Notification");
      }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(400, "Duplicate payment notification detected");
    }
    throw new AppError(400, `${error}`);
  }
  session.endSession();
};

const fetchNotifyPayments = async (idNo: string) => {
  if (!idNo) {
    throw new AppError(400, "Member idNo is required");
  }
  const actorId = await Actor.findOne({ idNo }).select("_id").lean();
  const notifyPayments = await NotifyPayment.find({
    actorId,
  }).sort({ createdAt: -1 });
  if (!notifyPayments || notifyPayments.length < 1) {
    throw new AppError(202, "No notify payment");
  }
  return notifyPayments;
};

const paymentSubmitted = async (
  senderNumber: string,
  transactionId: string,
  notifyPaymentId: string,
  actorId: string,
  type: string,
  year: string,
  amount: string,
) => {
  if (!senderNumber) {
    throw new AppError(400, "senderNumber is required");
  }
  if (!transactionId) {
    throw new AppError(400, "Member transactionId is required");
  }
  if (!type || !year || !amount) {
    throw new AppError(400, "type,year,amount is required");
  }
  if (!notifyPaymentId) {
    throw new AppError(400, "Member notifyPaymentId is required");
  }

  const existing = await NotifyPayment.findById(notifyPaymentId).lean();
  if (!existing) {
    throw new AppError(400, "This notify payment not found");
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updateNotifyPayment = await NotifyPayment.findByIdAndUpdate(
        notifyPaymentId,
        {
          $set: {
            status: "paid",
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );
      if (!updateNotifyPayment) {
        throw new AppError(400, "Updated failed");
      }
      await ActorPayment.create(
        [
          {
            actor: actorId,
            notifyPayment: updateNotifyPayment._id,
            type,
            year,
            amount: Number(amount),
            transactionId,
            number: senderNumber,
            desc: updateNotifyPayment.desc,
          },
        ],
        { session },
      );
      await Notification.create(
        [
          {
            recipientRole: ["admin", "superadmin"],
            type: "PAYMENT_SUBMITTED",
            title: "Payment verify Notification",
            message:
              "New payment submitted by an actor. Verification required.",
            isRead: false,
            notifyPayment: updateNotifyPayment._id,
          },
        ],
        { session },
      );
    });
  } catch (error) {}
  session.endSession();
};

const fetchActorPayments = async (idNo: string) => {
  if (!idNo) {
    throw new AppError(400, "Member idNo is required");
  }
  const actorId = await Actor.findOne({ idNo }).select("_id").lean();
  const actorPayments = await ActorPayment.find({
    actor: actorId,
    status: "verified",
  }).sort({ createdAt: -1 });
  if (!actorPayments || actorPayments.length < 1) {
    throw new AppError(202, "No actor Payments");
  }
  return actorPayments;
};
const verifyActorPayment = async (paymentId: string, notifyPayment: string) => {
  if (!paymentId) {
    throw new AppError(400, "paymentId is required");
  }
  if (!notifyPayment) {
    throw new AppError(400, "notifyPayment is required");
  }

  const existing = await NotifyPayment.findById(notifyPayment).lean();
  if (!existing) {
    throw new AppError(400, "This notify payment not found");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updateNotifyPayment = await NotifyPayment.findByIdAndDelete(
        notifyPayment,
        {
          new: true,
          runValidators: true,
          session,
        },
      );
      if (!updateNotifyPayment) {
        throw new AppError(400, "Updated failed");
      }
      await Notification.findOneAndUpdate(
        { notifyPayment, type: "PAYMENT_SUBMITTED" },

        { $set: { isRead: true } },
        { new: true, runValidators: true, session },
      );
      await ActorPayment.findByIdAndUpdate(
        paymentId,
        {
          $set: { status: "verified" },
        },
        { session },
      );
      // await Notification.create(
      //   [
      //     {
      //       recipientRole: ["admin", "superadmin"],
      //       type: "PAYMENT_SUBMITTED",
      //       title: "Payment verify Notification",
      //       message:
      //         "New payment submitted by an actor. Verification required.",
      //       isRead: false,
      //     },
      //   ],
      //   { session },
      // );
    });
  } catch (error) {}
  session.endSession();
};
interface DashboardParams {
  year: string;
  yearlyFee: number;
}

const getPaymentDashboardStats = async ({ year }: DashboardParams) => {
  /* =====================================
     🎯 PAID AMOUNT
  ====================================== */

  const amountResult = await ActorPayment.aggregate([
    { $match: { year } },
    {
      $facet: {
        verified: [
          { $match: { status: "verified" } },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ],
        pending: [
          { $match: { status: "pending" } },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);
  const totalPaidAmount = amountResult[0].verified[0]?.totalAmount || 0;
  const needVerifyAmount = amountResult[0].pending[0]?.totalAmount || 0;

  const totalPaidActor = amountResult[0].verified[0]?.count || 0;
  const needVerifyCount = amountResult[0].pending[0]?.count || 0;

  /* =====================================
     🎯 UNPAID ACTORS
  ====================================== */

  const unpaidAmountResult = await NotifyPayment.aggregate([
    {
      $match: {
        year: Number(year),
        status: "request",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        actor: { $sum: 1 },
      },
    },
  ]);
console.log(unpaidAmountResult)
  const totalActorUnpaidAmount = unpaidAmountResult[0]?.totalAmount || 0;
  const totalActorUnpaid = unpaidAmountResult[0]?.actor || 0;

  /* =====================================
     🎯 NEW MEMBER PAYMENT
  ====================================== */

  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31T23:59:59.999Z`);

  const newMemberData = await Payment.aggregate([
    {
      $match: {
        status: "verified",
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalMembers: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const totalNewMemberPaid =
    newMemberData.length > 0 ? newMemberData[0].totalMembers : 0;

  const totalNewMemberAmount =
    newMemberData.length > 0 ? newMemberData[0].totalAmount : 0;

  const totalHandCash = totalPaidActor + totalNewMemberAmount;
  console.log(totalHandCash)
  /* =====================================
     🎯 RETURN
  ====================================== */

  return {
    actor: {
      paid: {
        totalActors: totalPaidActor,
        totalAmount: totalPaidAmount,
      },
      paymentVerifying: {
        totalActors: needVerifyCount,
        totalAmount: needVerifyAmount,
      },
      unpaid: {
        totalActors: totalActorUnpaid,
        totalAmount: totalActorUnpaidAmount,
      },
    },
    newMember: {
      totalMembers: totalNewMemberPaid,
      totalAmount: totalNewMemberAmount,
    },
  };
};

export const ActorPaymentService = {
  actorPaymentInfo,
  notifyActorForPayment,
  fetchNotifyPayments,
  paymentSubmitted,
  fetchActorPayments,
  verifyActorPayment,
  getPaymentDashboardStats,
};
