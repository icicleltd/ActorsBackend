"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeAMemberService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const error_1 = require("../middleware/error");
const beAMember_schema_1 = __importDefault(require("./beAMember.schema"));
const payment_schema_1 = require("../payment/payment.schema");
const notification_schema_1 = require("../notification/notification.schema");
const serialCounter_schema_1 = require("../serialCounter/serialCounter.schema");
const applicationSubmitted_1 = require("../helper/mailTempate/applicationSubmitted");
const emailHelper_1 = require("../helper/emailHelper");
/* ------------------------------------
   CREATE BE A MEMBER
------------------------------------- */
const createBeAMember = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "Be a mebmer info required");
    }
    if (!payload.dob) {
        throw new error_1.AppError(400, "Date of birth required");
    }
    const dob = new Date(payload.dob);
    const beAMemberData = {
        ...payload,
        dob,
    };
    delete beAMemberData.bkashNumber;
    delete beAMemberData.transactionId;
    delete beAMemberData.amount;
    // const paymentInfo: PaymentPayload = {
    //   senderNumber: payload.bkashNumber,
    //   transactionId: payload.transactionId,
    //   amount: payload.amount,
    // };
    const session = await mongoose_1.default.startSession();
    try {
        let createdBeAMember = null;
        await session.withTransaction(async () => {
            const [beAMember] = await beAMember_schema_1.default.create([beAMemberData], { session });
            createdBeAMember = beAMember;
            const [payment] = await payment_schema_1.Payment.create([
                {
                    beAMember: beAMember._id,
                    transactionId: payload.transactionId,
                    amount: payload.amount,
                    senderNumber: payload.bkashNumber,
                },
            ], { session });
            await beAMember_schema_1.default.findByIdAndUpdate(beAMember._id, {
                payment: beAMember._id,
            }, { session });
            const [notification] = await notification_schema_1.Notification.create([
                {
                    recipientRole: ["admin", "superadmin"],
                    type: "PAYMENT_SUBMITTED",
                    title: "New Membership Payment",
                    message: `${beAMember.fullName} submitted a membership payment`,
                    application: beAMember._id,
                    payment: payment._id,
                },
            ], { session });
            if (payload.actorReference?.length) {
                const referenceNotifications = payload.actorReference.map((ref) => ({
                    recipientRole: ["member", "admin", "superadmin"],
                    recipient: new mongoose_1.default.Types.ObjectId(ref.actorId),
                    type: "REFERENCE_REQUEST",
                    title: "Reference Approval Request",
                    message: `${beAMember.fullName} listed you as a reference for Actors Equity membership`,
                    application: beAMember._id,
                }));
                await notification_schema_1.Notification.insertMany(referenceNotifications, { session });
            }
            await serialCounter_schema_1.Counter.findOneAndUpdate({ name: "be_a_member" }, {
                $inc: { seq: 1 },
            });
        });
        if (!createdBeAMember) {
            throw new error_1.AppError(500, "Failed to create application");
        }
        const { subject, text, html } = (0, applicationSubmitted_1.applicationSubmittedTemplate)(payload.fullName);
        (0, emailHelper_1.sendMail)({
            to: payload.email,
            subject,
            text,
            html,
        });
        return createdBeAMember;
    }
    catch (error) {
        console.log("be a member tarasation error", error);
        throw new error_1.AppError(400, `${error}`);
    }
    finally {
        session.endSession();
    }
};
/* ------------------------------------
   GET ALL BE A MEMBERS
------------------------------------- */
const getBeAMembers = async () => {
    const members = await actor_schema_1.default.find().sort({ createdAt: -1 });
    return members;
};
/* ------------------------------------
   DELETE SINGLE BE A MEMBER
------------------------------------- */
const deleteBeAMember = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Be a Member ID is required");
    }
    const member = await actor_schema_1.default.findById(id);
    if (!member) {
        throw new error_1.AppError(404, "Be a Member entry not found");
    }
    // If you later store publicId, uncomment this
    // await deleteFromCloudinary(member.publicId);
    await actor_schema_1.default.findByIdAndDelete(id);
    return member;
};
/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
exports.BeAMemberService = {
    createBeAMember,
    getBeAMembers,
    deleteBeAMember,
};
