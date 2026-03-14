import mongoose, { Types } from "mongoose";
import Actor from "../actor/actor.schema";
import { deleteFromCloudinary } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { Payment } from "./payment.schema";
import BeAMember from "../beAMember/beAMember.schema";
import { Notification } from "../notification/notification.schema";
import { sendMail } from "../helper/emailHelper";
import { applicationVerifiedTemplate } from "../helper/mailTempate/applicationApproved";
import { paymentVerifiedTemplate } from "../helper/mailTempate/paymentVarificaion";

const BE_A_MEMBER_TYPES = [
  "BE_A_MEMBER",
  "PAYMENT_SUBMITTED",
  "APPLICATION_APPROVED",
  "APPLICATION_REJECTED",
];

/* ------------------------------------
   CREATE BE A MEMBER
------------------------------------- */
const getBeAMemberPayments = async ({
  limit,
  skip,
  sortBy = "createdAt",
  sortOrder = -1,
}: {
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: -1 | 1;
}) => {
  const [beAMemberPayments, total] = await Promise.all([
    Payment.find({})
      .populate("beAMember", "fullName")
      .limit(limit)
      .skip(skip)
      .sort({ [sortBy]: sortOrder }),
    Payment.countDocuments(),
  ]);

  if (!beAMemberPayments) {
    throw new AppError(400, "Be a Member entry not created");
  }
  const totalPages = Math.floor(total / limit);
  return { beAMemberPayments, totalPages };
};

const verifyPayment = async ({
  paymentId,
  status,
  adminId,
  rejectionReason,
  message,
}: {
  paymentId: string;
  status: "approved" | "rejected";
  adminId: string;
  rejectionReason?: string;
  message?: string;
}) => {
  console.log(paymentId,status, adminId, rejectionReason, message)
  const session = await mongoose.startSession();

  try {
    let updatedPayment: any;

    await session.withTransaction(async () => {
      const application = await BeAMember.findOne({
        payment: new Types.ObjectId(paymentId)
      }).session(
        session,
      );

      if (!application) {
        throw new AppError(404, "Application not found");
      }

      // 1️⃣ Update Payment
      updatedPayment = await Payment.findOneAndUpdate(
        { beAMember: application._id },
        {
          $set: {
            status: status === "approved" ? "verified" : "rejected",
            verifiedBy: status === "approved" ? adminId : null,
            verifiedAt: status === "approved" ? new Date() : null,
            rejectionReason: status === "rejected" ? rejectionReason : null,
          },
        },
        { new: true, session },
      );

      if (!updatedPayment) {
        throw new AppError(404, "Payment record not found");
      }

      // 2️⃣ Update Notification
      await Notification.findOneAndUpdate(
        {
          application: application._id,
          type: "PAYMENT_SUBMITTED",
        },
        {
          $set: {
            isRead: true,
          },
        },
        { session },
      );

      // 3️⃣ Send Mail
      const { subject, html, text } = paymentVerifiedTemplate(
        application.fullName,
        message,
      );

      sendMail({
        to: application.email,
        subject,
        text,
        html,
      });
    });

    return updatedPayment;
  } finally {
    session.endSession();
  }
};

/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
export const BeAMemberPaymentService = {
  getBeAMemberPayments,
  verifyPayment
};
