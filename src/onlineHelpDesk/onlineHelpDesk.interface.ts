import { Types } from "mongoose";
export interface ITargetRoleIds {
  actorId: Types.ObjectId;
  isMemberRead: boolean;
}
export interface ITargetRoleReply {
  actorId: Types.ObjectId;
  actorReply: string;
}

export interface IHelpDeskTicket {
  ticketId: string;

  subject: string;
  messages: [
    {
      sender: Types.ObjectId;
      senderModel: string;
      message: string;
      file: string;
      createdAt: Date;
    },
  ];
  file?: string;

  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";

  createdBy: Types.ObjectId; // Actor who created ticket
  assignedTo?: Types.ObjectId; // Admin or support agent

  targetRole?: "single_actor" | "executive_member" | "advisor_member" | "all";

  adminReply?: string;
  targetRoleReply?: ITargetRoleReply[];
  targetActorIds?: ITargetRoleIds[];
  isAdminRead: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
export interface Member {
  _id: string;
  name: string;
  email: string;
}
export interface IAssignTicketPayload {
  ticketId: string;
  actor: Member[];
  advisorYear: string[];
  executiveYear: string[];
}
export const ROLE_ORDER = [
  "president",
  "vice_president",
  "general_secretary",
  "joint_secretary",
  "organizing_secretary",
  "finance_secretary",
  "office_secretary",
  "event_secretary",

  // newly added (snake_case)
  "law_secretary",
  "social_welfare_secretary",

  "law_welfare_secretary",
  "publicity_secretary",
  "it_secretary",
  "executive_member",
];
