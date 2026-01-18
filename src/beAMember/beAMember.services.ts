import mongoose from "mongoose";
import Actor from "../actor/actor.schema";
import { deleteFromCloudinary } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { IBeAMember, IBeAMemberPayload } from "./beAMember.interface";
import BeAMember from "./beAMember.schema";
import { PaymentPayload } from "../payment/payment.interface";
import { Payment } from "../payment/payment.schema";
import { Notification } from "../notification/notification.schema";
import { Counter } from "../serialCounter/serialCounter.schema";

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
    let createBeAMember;
    await session.withTransaction(async () => {
      const [beAMember] = await BeAMember.create([beAMemberData], { session });
      createBeAMember = beAMember;
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
          payment: beAMember._id,
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
          recipientRole: ["member","admin", "superadmin"],
          recipient: new mongoose.Types.ObjectId(ref.actorId),
          type: "REFERENCE_REQUEST",
          title: "Reference Approval Request",
          message: `${beAMember.fullName} listed you as a reference for Actors Equity membership`,
          application: beAMember._id,
        }));

        await Notification.insertMany(referenceNotifications, { session });
      }

      await Counter.findOneAndUpdate(
        { name: "be_a_member" },
        {
          $inc: { seq: 1 },
        },
      );
    });
    return createBeAMember;
  } catch (error) {
    console.log(error);
    throw new AppError(400, `${error}`);
  } finally {
    session.endSession();
  }
};

/* ------------------------------------
   GET ALL BE A MEMBERS
------------------------------------- */
const getBeAMembers = async () => {
  const members = await Actor.find().sort({ createdAt: -1 });
  return members;
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
};
