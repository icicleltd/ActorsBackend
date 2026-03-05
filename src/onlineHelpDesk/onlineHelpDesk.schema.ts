import { Schema, model } from "mongoose";
import { IHelpDeskTicket } from "./onlineHelpDesk.interface";

const helpDeskSchema = new Schema<IHelpDeskTicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    file: {
      type: String,
    },

    status: {
      type: String,
      enum: ["open", "pending", "resolved"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Actor",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },

    targetRole: {
      type: String,
      enum: ["single_actor", "executive_member", "advisor_member", "all"],
      default: "single_actor",
    },

    adminReply: {
      type: String,
    },
  },
  { timestamps: true },
);

export const HelpDesk = model<IHelpDeskTicket>("HelpDesk", helpDeskSchema);
