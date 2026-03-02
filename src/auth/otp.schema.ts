import mongoose, { Schema, Types } from "mongoose";

export interface IActorOTP extends Document {
  actor: Types.ObjectId;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}
const actorOtpSchema = new Schema<IActorOTP>(
  {
    actor: {
      type: Types.ObjectId,
      ref: "Actor",
      required: true,
    //   unique: true,
    },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
actorOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const ActorOTP = mongoose.model<IActorOTP>("ActorOTP", actorOtpSchema);
