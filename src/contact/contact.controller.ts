import { NextFunction, Request, Response } from "express";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import { ContactService } from "./contact.services";

/* ------------------------------------
   CREATE CONTACT (Frontend)
------------------------------------- */
const createContact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, message } = req.body;

    const result = await ContactService.createContact({
      name,
      email,
      phone,
      message,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Message sent successfully",
      data: result,
    });
  }
);

/* ------------------------------------
   GET ALL CONTACTS (Admin)
------------------------------------- */
const getContacts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // newest first by default
    const sortWith = (req.query?.sortWith as string) === "asc" ? 1 : -1;

    const result = await ContactService.getContacts(sortWith);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Contacts fetched successfully",
      data: result,
    });
  }
);

export const ContactController = {
  createContact,
  getContacts,
};
