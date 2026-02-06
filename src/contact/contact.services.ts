import mongoose from "mongoose";
import { AppError } from "../middleware/error";
import { ContactAttrs } from "./contact.interface";
import { ContactUs } from "./contact.schema";
import { Notification } from "../notification/notification.schema";

/* ------------------------------------
   CREATE CONTACT
------------------------------------- */
const createContact = async (payload: ContactAttrs) => {
  const { name, email, phone, message } = payload;

  if (!email) throw new AppError(400, "Email is required");
  if (!message) throw new AppError(400, "Message is required");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [contact] = await ContactUs.create(
      [
        {
          name: name ?? "",
          email,
          phone: phone ?? "",
          message,
          status: "new",
        },
      ],
      { session },
    );

    if (!contact?._id) {
      throw new AppError(400, "Contact not created");
    }

    await Notification.create(
      [
        {
          recipientRole: ["admin", "superadmin"],
          type: "CONTACT",
          title: "New contact message",
          message: `From ${contact.email}${contact.name ? ` (${contact.name})` : ""}`,
          contact: contact._id, // requires `contact` field in schema
          isRead: false,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return contact;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* ------------------------------------
   GET ALL CONTACTS
------------------------------------- */
const getContacts = async (sortWith: 1 | -1 = -1) => {
  // newest first by default
  const contacts = await ContactUs.find().sort({ createdAt: sortWith });
  return contacts;
};

export const ContactService = {
  createContact,
  getContacts,
};
