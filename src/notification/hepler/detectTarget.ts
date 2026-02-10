import Schedule from "../../appointments/appointments.schema";
import BeAMember from "../../beAMember/beAMember.schema";
import { ContactUs } from "../../contact/contact.schema";
import { Payment } from "../../payment/payment.schema";
import { Types } from "mongoose";
import { NotificationType } from "../notification.interface";


export const getTarget = ({
  schedule,
  contact,
  payment,
  application,
}: {
  schedule?: string;
  contact?: string;
  payment?: string;
  application?: string;
}) => {
  if (schedule) return { key: "schedule", id: schedule };
  if (contact) return { key: "contact", id: contact };
  if (payment) return { key: "payment", id: payment };
  if (application) return { key: "application", id: application };
  return null;
};

export const MODEL_MAP: Record<
  string,
  {
    model: any;
    defaultUpdate?: Record<string, any>;
    resolveUpdate?: (args: {
      type: NotificationType;
      role: string;
      recipient: string;
    }) => {
      update: Record<string, any>;
      arrayFilters?: any[];
    } | null;
  }
> = {
  schedule: {
    model: Schedule,
    defaultUpdate: { isView: true },
  },
  contact: {
    model: ContactUs,
    defaultUpdate: { isView: true },
  },
  payment: {
    model: Payment,
    defaultUpdate: { isView: true },
  },
  application: {
    model: BeAMember,
    resolveUpdate: ({ type, role, recipient }) => {
      // Admin reading BE_A_MEMBER
      if (type === "BE_A_MEMBER" && role !== "member") {
        return {
          update: { isAdminRead: true },
        };
      }

      // Member reading REFERENCE_REQUEST
      if (type === "REFERENCE_REQUEST" && role === "member") {
        return {
          update: {
            "actorReference.$[elem].isMemberRead": true,
          },
          arrayFilters: [
            { "elem.actorId": new Types.ObjectId(recipient) },
          ],
        };
      }

      // Member reading BE_A_MEMBER
      if (type === "BE_A_MEMBER" && role === "member") {
        return {
          update: { isMemberRead: true },
        };
      }

      return null;
    },
  },
};



