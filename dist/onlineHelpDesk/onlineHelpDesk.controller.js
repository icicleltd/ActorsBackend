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
   GET assign ticket
------------------------------------- */
const getAssignTickets = (0, catchAsync_1.default)(async (req, res, next) => {
    const id = req.user?.data._id;
    const role = req.user?.data.role;
    const idNo = req.query.idNo;
    const limit = req.query.limit
        ? parseInt(req.query.limit, 10)
        : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const skip = (page - 1) * limit;
    const result = await onlineHelpDesk_services_1.HelpDeskService.getAssignTickets({
        id,
        idNo,
        limit,
        page,
        skip,
        role,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Assign Tickets fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   GET ALL TICKETS
------------------------------------- */
const getTickets = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user?.data;
    const limit = req.query.limit
        ? parseInt(req.query.limit, 10)
        : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const idNo = req.query.idNo;
    const skip = (page - 1) * limit;
    const view = req.query.view;
    const result = await onlineHelpDesk_services_1.HelpDeskService.getTickets({
        user,
        limit,
        page,
        skip,
        idNo, view
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tickets fetched successfully",
        data: result,
    });
});
/* ------------------------------------
   Assign TICKET
------------------------------------- */
const assignTicket = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    const result = await onlineHelpDesk_services_1.HelpDeskService.assignTicket({ payload });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Ticket assign successfully",
        data: result,
    });
});
// update
const reply = (0, catchAsync_1.default)(async (req, res, next) => {
    const { ticketId, message, file } = req.body;
    const actorId = req.user?.data._id;
    const role = req.user?.data.role;
    const result = await onlineHelpDesk_services_1.HelpDeskService.reply({
        actorId,
        ticketId,
        message,
        file,
        role
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "reply created successfully",
        data: result,
    });
});
exports.HelpDeskController = {
    createTicket,
    getTickets,
    assignTicket,
    getAssignTickets,
    reply,
};
