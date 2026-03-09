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

    messages: [
    {
      sender: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "messages.senderModel",
      },

      senderModel: {
        type: String,
        enum: ["Actor", "Admin"],
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      file: String,

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

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
    targetRoleReply: [
      {
        actorId: {
          type: Schema.Types.ObjectId,
          ref: "Actor",
        },
        actorReply: String,
      },
    ],
    targetActorIds: [
      {
        actorId: {
          type: Schema.Types.ObjectId,
          ref: "Actor",
        },

        isMemberRead: {
          type: Boolean,
          default: false,
        },
      },
    ],

    targetRole: {
      type: String,
      enum: ["actor", "executive_member", "advisor_member", "all"],
      default: "actor",
    },

    adminReply: {
      type: String,
    },
    isAdminRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const HelpDesk = model<IHelpDeskTicket>("HelpDesk", helpDeskSchema);
