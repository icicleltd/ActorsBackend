"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpDeskController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const onlineHelpDesk_services_1 = require("./onlineHelpDesk.services");
/* ------------------------------------
   CREATE TICKET
------------------------------------- */
const createTicket = (0, catchAsync_1.default)(async (req, res, next) => {
    const { ticketId, subject, message, file } = req.body;
    const actorId = req.user?.data._id;
    const result = await onlineHelpDesk_services_1.HelpDeskService.createTicket(actorId, {
        ticketId,
        subject,
        message,
        file,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Ticket created successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL TICKETS
------------------------------------- */
const getTickets = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user?.data;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const skip = (page - 1) * limit;
    const result = await onlineHelpDesk_services_1.HelpDeskService.getTickets({ user, limit, page, skip });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tickets fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   GET SINGLE TICKET
------------------------------------- */
const getSingleTicket = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await onlineHelpDesk_services_1.HelpDeskService.getSingleTicket(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Ticket fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE SINGLE TICKET
------------------------------------- */
const deleteTicket = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await onlineHelpDesk_services_1.HelpDeskService.deleteTicket(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Ticket deleted successfully",
        data: result,
    });
});
/* ------------------------------------
   DELETE ALL TICKETS
------------------------------------- */
const deleteAllTickets = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await onlineHelpDesk_services_1.HelpDeskService.deleteAllTickets();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All tickets deleted successfully",
        data: result,
    });
});
exports.HelpDeskController = {
    createTicket,
    getTickets,
    getSingleTicket,
    deleteTicket,
    deleteAllTickets,
};
