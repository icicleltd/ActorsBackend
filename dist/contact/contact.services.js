"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = require("../middleware/error");
const contact_schema_1 = require("./contact.schema");
const notification_schema_1 = require("../notification/notification.schema");
/* ------------------------------------
   CREATE CONTACT
------------------------------------- */
const createContact = async (payload) => {
    const { name, email, phone, message } = payload;
    if (!email)
        throw new error_1.AppError(400, "Email is required");
    if (!message)
        throw new error_1.AppError(400, "Message is required");
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const [contact] = await contact_schema_1.ContactUs.create([
            {
                name: name ?? "",
                email,
                phone: phone ?? "",
                message,
                status: "new",
            },
        ], { session });
        if (!contact?._id) {
            throw new error_1.AppError(400, "Contact not created");
        }
        await notification_schema_1.Notification.create([
            {
                recipientRole: ["admin", "superadmin"],
                type: "CONTACT",
                title: "New contact message",
                message: `From ${contact.email}${contact.name ? ` (${contact.name})` : ""}`,
                contact: contact._id, // requires `contact` field in schema
                isRead: false,
            },
        ], { session });
        await session.commitTransaction();
        return contact;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
/* ------------------------------------
   GET ALL CONTACTS
------------------------------------- */
const getContacts = async (sortWith = -1) => {
    // newest first by default
    const contacts = await contact_schema_1.ContactUs.find().sort({ createdAt: sortWith });
    return contacts;
};
exports.ContactService = {
    createContact,
    getContacts,
};
