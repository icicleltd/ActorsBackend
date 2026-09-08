import mongoose, { Types } from "mongoose";
import Actor from "../actor/actor.schema";
import { AppError } from "../middleware/error";
import {
  IActorPayment,
  INotifyActorPayload,
  INotifyPayment,
} from "./actor.payment.interface";
import { Notification } from "../notification/notification.schema";
import ActorPayment, { NotifyPayment } from "./actor.payment.schema";
import { INotification } from "../notification/notification.interface";
import { Payment } from "../payment/payment.schema";
import { PipelineStage } from "mongoose";

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
  page: number = 1,
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

  // Base pipeline: match -> lookup payments -> compute paid/amount
  const basePipeline: any[] = [
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

  // Status filtering — applied before the $facet split so both
  // the data branch and the count branch reflect the same filter
  if (status === "paid") {
    basePipeline.push({ $match: { paid: true } });
  }

  if (status === "pending") {
    basePipeline.push({ $match: { paid: false } });
  }

  // $facet: paginated data + total count in a single query
  const pipeline: any[] = [
    ...basePipeline,
    {
      $facet: {
        data: [
          {
            $project: {
              fullName: 1,
              idNo: 1,
              dob: 1,
              paid: 1,
              amount: 1,
              status: 1,
            },
          },
          { $sort: { [sortBy]: sortWith } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $project: {
        data: 1,
        total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
      },
    },
  ];

  const result = await Actor.aggregate(pipeline);
  const actors = result[0]?.data ?? [];
  const total = result[0]?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return { actors, total, totalPages, page, limit };
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
        year: Number(year),
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
  idNo: string,
  method: "bkash" | "Nagad" | "Cash",
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
  const actor = await Actor.findOne({ idNo }).select("_id").lean();
  if (!actor) {
    throw new AppError(400, "Actor not found");
  }
  const isSame = actor._id.toString() === actorId;
  if (!isSame) {
    throw new AppError(
      403,
      "You are not authorized to submit payment for this actor.",
    );
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
            number: senderNumber,
            year: Number(year),
            amount: Number(amount),
            transactionId,
            isView: true,
            method: method,
          },
        },
        {
          returnDocument: "after",
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
            year: Number(year),
            amount: Number(amount),
            transactionId,
            number: senderNumber,
            desc: updateNotifyPayment.desc,
            status: "pending",
          },
        ],
        { session },
      );
      await Notification.findOneAndDelete(
        {
          notifyPayment: notifyPaymentId,
          recipient: actor._id,
        },
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
  } finally {
    await session.endSession();
  }
};

const fetchActorPayments = async (idNo: string) => {
  if (!idNo) {
    throw new AppError(400, "Member idNo is required");
  }
  const actorId = await Actor.findOne({ idNo }).select("_id").lean();
  const actorPayments = await ActorPayment.find({
    actor: actorId,
    // status: "verified",
  }).sort({ createdAt: -1 });
  if (!actorPayments || actorPayments.length < 1) {
    throw new AppError(202, "No actor Payments");
  }
  return actorPayments;
};
const verifyActorPayment = async (notifyPayment: string) => {
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
      // const updateNotifyPayment = await NotifyPayment.findByIdAndUpdate(
      //   notifyPayment,
      //   {
      //     $set: {
      //       status: "paid",
      //     },
      //   },
      //   {
      //     new: true,
      //     runValidators: true,
      //     session,
      //   },
      // );
      // if (!updateNotifyPayment) {
      //   throw new AppError(400, "Updated failed");
      // }
      await Notification.findOneAndUpdate(
        { notifyPayment, type: "PAYMENT_SUBMITTED" },

        { $set: { isRead: true } },
        { new: true, runValidators: true, session },
      );
      const updateActorPayment = await ActorPayment.findOneAndUpdate(
        { notifyPayment: new Types.ObjectId(notifyPayment) },
        {
          $set: { status: "verified" },
        },
        { session },
      );
      if (!updateActorPayment) {
        throw new AppError(400, "Updated failed");
      }
      await NotifyPayment.findOneAndDelete(
        {
          _id: notifyPayment,
          status: "paid",
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

  const totalHandCash = totalPaidAmount + totalNewMemberAmount;
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
    totalHandCash,
  };
};
interface QueryParams {
  search?: string;
  filter?: "unpaid" | "needVerified" | "paid";
  page?: number;
  limit?: number;
  sortBy: string;
  sortOrder: 1 | -1;
  skip: number;
  year?: number;
}
interface ActorPaymentStatusQuery {
  search?: string;
  filter?: "paid" | "unpaid" | "all";
  page?: number;
  limit?: number;
  sortBy: string;
  sortOrder: 1 | -1;
  skip: number;
  year?: number;
}

const getMergedPaymentsFromDB = async (query: QueryParams) => {
  const {
    search,
    filter,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = -1,
    skip = 0,
    year,
  } = query;

  const pipeline: PipelineStage[] = [];

  /**
   * Lookup actorPayments
   */
  pipeline.push({
    $lookup: {
      from: "actorpayments",
      localField: "_id",
      foreignField: "notifyPayment",
      as: "actorPayment",
    },
  });

  pipeline.push({
    $unwind: {
      path: "$actorPayment",
      preserveNullAndEmptyArrays: true,
    },
  });

  /**
   * Populate actor
   */
  pipeline.push({
    $lookup: {
      from: "actors",
      localField: "actorId",
      foreignField: "_id",
      as: "actor",
    },
  });

  pipeline.push({
    $unwind: "$actor",
  });

  /**
   * Normalize year (string vs number problem)
   */
  pipeline.push({
    $addFields: {
      notifyYear: { $toInt: "$year" },
      actorPaymentYear: {
        $cond: [
          { $ifNull: ["$actorPayment.year", false] },
          { $toInt: "$actorPayment.year" },
          null,
        ],
      },
    },
  });

  /**
   * Search
   */
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "actor.fullName": { $regex: search, $options: "i" } },
          { "actor.idNo": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  /**
   * Year filter
   */
  if (typeof year === "number" && !Number.isNaN(year)) {
    pipeline.push({
      $match: {
        $or: [{ notifyYear: year }, { actorPaymentYear: year }],
      },
    });
  }

  /**
   * Status filter
   */

  // unpaid → admin requested but member didn't pay
  if (filter === "unpaid") {
    pipeline.push({
      $match: {
        status: "request",
        actorPayment: null,
      },
    });
  }

  // pending → member paid but admin not verified
  if (filter === "needVerified") {
    pipeline.push({
      $match: {
        "actorPayment.status": "pending",
      },
    });
  }

  // verified → admin verified payment
  if (filter === "paid") {
    pipeline.push({
      $match: {
        "actorPayment.status": "verified",
      },
    });
  }

  /**
   * Final merged status
   */
  pipeline.push({
    $addFields: {
      finalStatus: {
        $cond: [
          { $eq: ["$actorPayment.status", "verified"] },
          "verified",
          {
            $cond: [
              { $eq: ["$actorPayment.status", "pending"] },
              "pending",
              "requested",
            ],
          },
        ],
      },
    },
  });

  /**
   * Projection
   */
  pipeline.push({
    $project: {
      amount: 1,
      number: 1,
      year: "$notifyYear",
      desc: 1,
      finalStatus: 1,
      createdAt: 1,
      // transactionId:1,

      actor: {
        _id: "$actor._id",
        fullName: "$actor.fullName",
        idNo: "$actor.idNo",
        photo: "$actor.photo",
      },

      payment: "$actorPayment",
    },
  });

  /**
   * Sorting
   */
  pipeline.push({
    $sort: {
      [sortBy]: sortOrder,
    },
  });

  /**
   * Pagination
   */
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      meta: [{ $count: "total" }],
    },
  });

  const result = await NotifyPayment.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.meta[0]?.total || 0;

  return {
    meta: {
      page,
      limit,
      total,
    },
    data,
  };
};
const yearlyActorPaymentStats = async (query: QueryParams) => {
  const {
    search,
    filter,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = -1,
    skip = 0,
    year,
  } = query;

  if (filter && !["unpaid", "needVerified", "paid", "all"].includes(filter)) {
    throw new AppError(
      400,
      "Invalid filter value. Must be 'unpaid', 'needVerified', 'all', or 'paid'.",
    );
  }
  if (
    (filter === "paid" || filter === "needVerified" || filter === "unpaid") &&
    !year
  ) {
    throw new AppError(400, `Year is required for '${filter}' filter.`);
  }
  const actorLookupStages = (search?: string) => {
    const stages: any[] = [
      {
        $lookup: {
          from: "actors",
          localField: "actor",
          foreignField: "_id",
          pipeline: [{ $project: { fullName: 1, photo: 1, idNo: 1 } }],
          as: "actorInfo",
        },
      },
      {
        $unwind: "$actorInfo",
      },
    ];
    if (search && search.trim()) {
      stages.push({
        $match: {
          $or: [
            { "actorInfo.fullName": { $regex: search, $options: "i" } },
            { "actorInfo.idNo": { $regex: search, $options: "i" } },
          ],
        },
      });
    }
    return stages;
  };

  const buildResult = (result: any[], pageNum: number, limitNum: number) => {
    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount?.[0]?.count ?? 0;

    return {
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  };

  const paginateFacet = (skip: number, limit: number) => ({
    $facet: {
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            source: 1,
            historyStatus: 1,
            date: 1,
            amount: 1,
            method: 1,
            type: 1,
            year: 1,
            status: 1,
            desc: 1,
            transactionId: 1,
            number: 1,
            actorInfo: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  if (filter === "paid" || filter === "needVerified") {
    const filterCondition = filter === "paid" ? "verified" : "pending";
    const match: Record<string, any> = {
      type: "membership",
      status: filterCondition,
      ...(year ? { year } : {}),
    };

    const pipeline: any[] = [
      { $match: match },
      {
        $addFields: {
          source: "ActorPayment",
          // historyStatus: "paid",
          historyStatus: {
            $cond: [{ $eq: ["$status", "verified"] }, "paid", "needVerified"],
          },
          date: "$verifiedAt",
        },
      },
      ...actorLookupStages(search),
      { $sort: { date: -1 } },
      paginateFacet(skip, limit),
    ];

    const result = await ActorPayment.aggregate(pipeline);
    return buildResult(result, page, limit);
  }

  if (filter === "unpaid") {
    const filterCondition = filter === "unpaid" ? "request" : "paid";
    const match: Record<string, any> = {
      type: "membership",
      status: "request",
      ...(year ? { year } : {}),
    };
    const pipeline: any[] = [
      { $match: match },
      {
        $addFields: {
          source: "NotifyPayment",
          historyStatus: filter,
          date: "$createdAt",
          actor: "$actorId",
        },
      },
      ...actorLookupStages(search),
      { $sort: { [sortBy]: sortOrder } },
      paginateFacet(skip, limit),
    ];

    const result = await NotifyPayment.aggregate(pipeline);
    return buildResult(result, page, limit);
  }

  const actorPaymentMatch: Record<string, unknown> = {
    type: "membership",
    status: { $in: ["pending", "verified"] },
    ...(year ? { year } : {}),
  };
  const notifyPaymentMatch: Record<string, unknown> = {
    type: "membership",
    status: { $in: ["request"] },
    ...(year ? { year } : {}),
  };

  const pipeline: any[] = [
    { $match: actorPaymentMatch },
    {
      $addFields: {
        source: "ActorPayment",
        historyStatus: {
          $cond: [{ $eq: ["$status", "verified"] }, "paid", "needVerified"],
        },
        date: "$verifiedAt",
      },
    },
    {
      $unionWith: {
        coll: "notifypayments",
        pipeline: [
          { $match: notifyPaymentMatch },
          {
            $addFields: {
              source: "NotifyPayment",
              // historyStatus: {
              //   $cond: [{ $eq: ["$status", "paid"] }, "needVerified", "unpaid"],
              // },
              historyStatus: "unpaid",
              date: "$createdAt",
              actor: "$actorId",
            },
          },
        ],
      },
    },
    ...actorLookupStages(search),
    { $sort: { date: -1 } },
    paginateFacet(skip, limit),
  ];

  const result = await ActorPayment.aggregate(pipeline);
  return buildResult(result, page, limit);

  // return {
  //   meta: {
  //     page,
  //     limit,
  //     total,
  //   },
  //   data,
  // };
};

export interface IRecordActorPayment {
  actorIds: string[];
  desc: string;
  fee: number;
  year: number;
}
const recordActorPayment = async (
  payload: IRecordActorPayment,
  userId: Types.ObjectId,
) => {
  const { actorIds, fee, year, desc } = payload;

  actorIds.forEach((actorId) => {
    if (!Types.ObjectId.isValid(actorId)) {
      throw new AppError(404, "Invalid actorId");
    }
  });
  if (!fee) throw new AppError(400, "Fee is required");
  if (!year) throw new AppError(400, "Year is required");
  // if (!desc) throw new AppError(400, "Payment type  is required");
  const recordedActorPayment: Omit<
    IActorPayment,
    "notifyPayment" | "transactionId" | "number"
  >[] = actorIds.map((actorId) => ({
    actor: new Types.ObjectId(actorId),
    type: "membership",
    year,
    amount: fee,
    desc,
    method: "Cash",
    status: "verified",
    verifiedAt: new Date(),
    verifiedBy: userId,
  }));

  const result = await ActorPayment.create(recordedActorPayment);
  if (!result || result.length < 1) {
    throw new AppError(400, "Failed to record actor payment");
  }
  return result;
};

const actorPaymentHistory = async (query: ActorPaymentStatusQuery) => {
  const {
    search,
    filter,
    page = 1,
    limit = 10,
    sortBy = "idNo",
    sortOrder = -1,
    skip = 0,
    year,
  } = query;

  if (filter && !["unpaid", "needVerified", "paid", "all"].includes(filter)) {
    throw new AppError(
      400,
      "Invalid filter value. Must be 'unpaid', 'needVerified', 'all', or 'paid'.",
    );
  }
  if ((filter === "paid" || filter === "unpaid") && !year) {
    throw new AppError(400, `Year is required for '${filter}' filter.`);
  }

  const pipeline: any[] = [
    // 1. Only active actors (adjust if you want all)
    { $match: { isActive: true } },

    // 2. Search by fullName or idNo
    ...(search
      ? [
          {
            $match: {
              $or: [
                { fullName: { $regex: search, $options: "i" } },
                { idNo: { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
      : []),

    // 3. Look up this actor's membership payment for the given year
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
                  { $eq: ["$type", "membership"] },
                  { $eq: ["$year", year] },
                ],
              },
            },
          },
          { $limit: 1 }, // unique index guarantees at most 1 anyway
        ],
        as: "paymentInfo",
      },
    },

    // 4. Derive paid/unpaid status
    {
      $addFields: {
        paymentStatus: {
          $cond: [{ $gt: [{ $size: "$paymentInfo" }, 0] }, "paid", "unpaid"],
        },
        payment: { $arrayElemAt: ["$paymentInfo", 0] },
      },
    },

    // 5. Apply filter
    ...(filter !== "all" ? [{ $match: { paymentStatus: filter } }] : []),

    // 6. Shape output + paginate
    {
      $project: {
        _id: 1,
        fullName: 1,
        idNo: 1,
        photo: 1,
        dob: 1,
        phoneNumber: 1,
        paymentStatus: 1,
        payment: {
          _id: 1,
          amount: 1,
          method: 1,
          transactionId: 1,
          verifiedAt: 1,
          status: 1,
        },
      },
    },
    { $sort: { idNo: 1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Actor.aggregate(pipeline);
  const data = result[0]?.data ?? [];
  const total = result[0]?.totalCount?.[0]?.count ?? 0;

  return {
    data,
    meta: {
      page: page,
      limit: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export interface ReportFilter {
  year: number;
  type: "membership" | "event";
  status?: "pending" | "verified" | "rejected";
}

const MAX_CLIENT_ROWS = 5000;

const getPaymentReportCursor = async (filter: ReportFilter) => {
  const query: Record<string, unknown> = {
    type: filter.type,
    year: filter.year,
  };
  if (filter.status) query.status = filter.status;

  // run the cursor walk and the sum aggregation concurrently — independent queries, no need to wait sequentially
  const [walkResult, sumResult] = await Promise.all([
    walkPayments(query),
    ActorPayment.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    totalAmount: sumResult[0]?.totalAmount ?? 0, // sum across ALL matching rows, not just returned ones
    ...walkResult,
  };
};

async function walkPayments(query: Record<string, unknown>) {
  const cursor = ActorPayment.find(query)
    .select("actor amount desc status createdAt year method transactionId number type")
    .populate("actor", "fullName idNo")
    .lean()
    .maxTimeMS(60_000)
    // .sort({ actorIdNo: 1 })
    .sort({ createdAt: 1 })
    .cursor({ batchSize: 1000 });

  const results: unknown[] = [];
  let count = 0;
  let truncated = false;

  try {
    for await (const doc of cursor) {
      count++;
      if (results.length < MAX_CLIENT_ROWS) {
        results.push(doc);
      } else {
        truncated = true;
        break;
      }
    }
  } finally {
    await cursor.close();
  }

  return { total: count, returned: results.length, truncated, data: results };
}

export const ActorPaymentService = {
  actorPaymentInfo,
  notifyActorForPayment,
  fetchNotifyPayments,
  paymentSubmitted,
  fetchActorPayments,
  verifyActorPayment,
  getPaymentDashboardStats,
  getMergedPaymentsFromDB,
  recordActorPayment,
  yearlyActorPaymentStats,
  actorPaymentHistory,
  getPaymentReportCursor,
};
