import { Types } from "mongoose";

export interface IHelpDeskTicket {
  ticketId: string;

  subject: string;
  message: string;
  file?: string;

  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";

  createdBy: Types.ObjectId; // Actor who created ticket
  assignedTo?: Types.ObjectId; // Admin or support agent

  targetRole?: "single_actor" | "executive_member" | "advisor_member" | "all";

  adminReply?: string;
  targetRoleReply?: string;

  createdAt?: Date;
  updatedAt?: Date;
}