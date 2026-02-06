import { Schema, model } from "mongoose";
import { ContactDoc } from "./contact.interface";

const ContactSchema = new Schema<ContactDoc>(
  {
    name: { type: String, trim: true, maxlength: 120, default: "" },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },

    phone: { type: String, trim: true, maxlength: 40, default: "" },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [2, "Message is too short"],
      maxlength: [2000, "Message is too long"],
    },

    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
);

export const ContactUs = model<ContactDoc>("ContactUs", ContactSchema);
