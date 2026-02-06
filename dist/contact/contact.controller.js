"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const contact_services_1 = require("./contact.services");
/* ------------------------------------
   CREATE CONTACT (Frontend)
------------------------------------- */
const createContact = (0, catchAsync_1.default)(async (req, res, next) => {
    const { name, email, phone, message } = req.body;
    const result = await contact_services_1.ContactService.createContact({
        name,
        email,
        phone,
        message,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Message sent successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL CONTACTS (Admin)
------------------------------------- */
const getContacts = (0, catchAsync_1.default)(async (req, res, next) => {
    // newest first by default
    const sortWith = req.query?.sortWith === "asc" ? 1 : -1;
    const result = await contact_services_1.ContactService.getContacts(sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Contacts fetched successfully",
        data: result,
    });
});
exports.ContactController = {
    createContact,
    getContacts,
};
