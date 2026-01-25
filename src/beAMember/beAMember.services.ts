import mongoose, { Types } from "mongoose";
import Actor from "../actor/actor.schema";
import { deleteFromCloudinary } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { IBeAMember, IBeAMemberPayload } from "./beAMember.interface";
import BeAMember from "./beAMember.schema";
import { PaymentPayload } from "../payment/payment.interface";
import { Payment } from "../payment/payment.schema";
import { Notification } from "../notification/notification.schema";
import { Counter } from "../serialCounter/serialCounter.schema";
import { applicationSubmittedTemplate } from "../helper/mailTempate/applicationSubmitted";
import { sendMail } from "../helper/emailHelper";
import { applicationVerifiedTemplate } from "../helper/mailTempate/applicationApproved";
export type ApproveStatus = "approved" | "rejected";

export interface approveByAdminPayload {
  id: string; // BeAMember ID
  status: ApproveStatus;
  adminId: string;
  rejectionReason?: string;
  message?: string;
}

/* ------------------------------------
   CREATE BE A MEMBER
------------------------------------- */
const createBeAMember = async (payload: IBeAMemberPayload) => {
  if (!payload) {
    throw new AppError(400, "Be a mebmer info required");
  }
  if (!payload.dob) {
    throw new AppError(400, "Date of birth required");
  }
  const dob = new Date(payload.dob);
  const beAMemberData = {
    ...payload,
    dob,
  };
  delete (beAMemberData as any).bkashNumber;
  delete (beAMemberData as any).transactionId;
  delete (beAMemberData as any).amount;

  // const paymentInfo: PaymentPayload = {
  //   senderNumber: payload.bkashNumber,
  //   transactionId: payload.transactionId,
  //   amount: payload.amount,
  // };
  const session = await mongoose.startSession();
  try {
    let createdBeAMember: IBeAMember | null = null;
    await session.withTransaction(async () => {
      const [beAMember] = await BeAMember.create([beAMemberData], { session });
      createdBeAMember = beAMember;
      const [payment] = await Payment.create(
        [
          {
            beAMember: beAMember._id,
            transactionId: payload.transactionId,
            amount: payload.amount,
            senderNumber: payload.bkashNumber,
          },
        ],
        { session },
      );
      await BeAMember.findByIdAndUpdate(
        beAMember._id,
        {
          payment: payment._id,
        },
        { session },
      );
      const [notification] = await Notification.create(
        [
          {
            recipientRole: ["admin", "superadmin"],
            type: "PAYMENT_SUBMITTED",
            title: "New Membership Payment",
            message: `${beAMember.fullName} submitted a membership payment`,
            application: beAMember._id,
            payment: payment._id,
          },
        ],
        { session },
      );
      if (payload.actorReference?.length) {
        const referenceNotifications = payload.actorReference.map((ref) => ({
          recipientRole: ["member", "admin", "superadmin"],
          recipient: new mongoose.Types.ObjectId(ref.actorId),
          type: "REFERENCE_REQUEST",
          title: "Reference Approval Request",
          message: `${beAMember.fullName} listed you as a reference for Actors Equity membership`,
          application: beAMember._id,
        }));

        await Notification.insertMany(referenceNotifications, { session });
      }

      const counter = await Counter.findOneAndUpdate(
        { name: "be_a_member" },
        {
          $inc: { seq: 1 },
        },
      );
      if (!counter) {
        throw new AppError(500, "Failed to update member counter");
      }
      await Notification.create(
        [
          {
            recipientRole: ["admin", "superadmin"],
            type: "BE_A_MEMBER",
            title: "New Membership Application",
            message: `${beAMember.fullName} submitted a Be A Member application`,
            application: beAMember._id,
            payment: payment._id,
          },
        ],
        { session },
      );
    });

    if (!createdBeAMember) {
      throw new AppError(500, "Failed to create application");
    }

    const { subject, text, html } = applicationSubmittedTemplate(
      payload.fullName,
    );

    sendMail({
      to: payload.email,
      subject,
      text,
      html,
    });
    return createdBeAMember;
  } catch (error) {
    console.log("be a member tarasation error", error);
    throw new AppError(400, `${error}`);
  } finally {
    session.endSession();
  }
};

/* ------------------------------------
   GET ALL BE A MEMBERS
------------------------------------- */
const getBeAMembers = async (
  limit: number,
  skip: number,
  sortBy: string,
  sortWith: 1 | -1,
) => {
  const members = await BeAMember.find()
    .populate({
      path: "actorReference.actorId",
    })
    .populate({
      path: "payment",
      select: "method amount status verifiedAt",
    })
    .sort({ [sortBy]: sortWith })
    .limit(limit)
    .skip(skip);
  return members;
};

const approveByAdmin = async (payload: approveByAdminPayload) => {
  const { id, status, adminId, rejectionReason, message } = payload;
  if (!id) {
    throw new AppError(400, "Be a Member ID is required");
  }

  if (!["approved", "rejected", "pending"].includes(status)) {
    throw new AppError(400, "Invalid status value");
  }

  const session = await mongoose.startSession();

  try {
    let updatedBeAMember: any;
    let updatedPayment: any;

    await session.withTransaction(async () => {
      // 1️⃣ Fetch application first (status guard)
      const existingBeAMember = await BeAMember.findById(id).session(session);

      if (!existingBeAMember) {
        throw new AppError(404, "Be A Member application not found");
      }

      if (existingBeAMember.status === status) {
        throw new AppError(400, `Application is already ${status}`);
      }

      // 2️⃣ Update Be A Member status
      updatedBeAMember = await BeAMember.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true, session },
      );

      // 3️⃣ Update Payment
      updatedPayment = await Payment.findOneAndUpdate(
        { beAMember: updatedBeAMember._id },
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

      // 4️⃣ UPDATE existing Notification (NO CREATE)
      const updatedNotification = await Notification.findOneAndUpdate(
        {
          application: updatedBeAMember._id,
        },
        {
          $set: {
            recipientRole: ["admin", "superadmin"],
            type:
              status === "approved"
                ? "APPLICATION_APPROVED"
                : "APPLICATION_REJECTED",

            title:
              status === "approved"
                ? "Membership Application Approved"
                : "Membership Application Rejected",

            message:
              status === "approved"
                ? `${updatedBeAMember.fullName}'s membership application has been approved`
                : `${updatedBeAMember.fullName}'s membership application has been rejected`,

            payment: updatedPayment._id,
            isRead: false,
          },
        },
        { new: true, session },
      );

      if (!updatedNotification) {
        throw new AppError(404, "Notification not found for this application");
      }
      const { subject, html, text } = applicationVerifiedTemplate(
        existingBeAMember.fullName,
        message,
      );
      sendMail({
        to: existingBeAMember.email,
        subject,
        text,
        html,
      });
    });

    return {
      success: true,
      message:
        status === "approved"
          ? "Application approved successfully"
          : "Application rejected successfully",
      data: {
        application: updatedBeAMember,
        payment: updatedPayment,
      },
    };
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
};

/* ------------------------------------
   DELETE SINGLE BE A MEMBER
------------------------------------- */
const deleteBeAMember = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Be a Member ID is required");
  }

  const member = await Actor.findById(id);

  if (!member) {
    throw new AppError(404, "Be a Member entry not found");
  }

  // If you later store publicId, uncomment this
  // await deleteFromCloudinary(member.publicId);

  await Actor.findByIdAndDelete(id);

  return member;
};

/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
export const BeAMemberService = {
  createBeAMember,
  getBeAMembers,
  deleteBeAMember,
  approveByAdmin,
};
