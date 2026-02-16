"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const sendResponse_1 = __importDefault(require("../shared/sendResponse"));
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const event_services_1 = require("./event.services");
const createEvent = (0, catchAsync_1.default)(async (req, res, next) => {
    const payload = req.body;
    // const adminId = req.user?.id;
    const result = await event_services_1.EventService.createEvent(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Event created successfully",
        data: result,
    });
});
const getEvents = (0, catchAsync_1.default)(async (req, res, next) => {
    const eventType = req.query.eventType;
    const sortBy = req.query.sortBy;
    const sortWith = req.query.sortWith === "asc"
        ? 1
        : req.query.sortWith === "desc"
            ? -1
            : -1;
    const payload = {};
    if (eventType === "PAST" || eventType === "UPCOMING") {
        payload.eventType = eventType;
    }
    const result = await event_services_1.EventService.getEvents(payload, sortBy, sortWith);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Events fetched successfully",
        data: result,
    });
});
const getAdminEvents = (0, catchAsync_1.default)(async (req, res, next) => {
    const adminId = req.params.id;
    const result = await event_services_1.EventService.getAdminEvents(adminId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admin events fetched successfully",
        data: result,
    });
});
const readEvent = (0, catchAsync_1.default)(async (req, res, next) => {
    const eventId = req.params.id;
    const result = await event_services_1.EventService.readEvent(eventId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Event updated successfully",
        data: result,
    });
});
const deleteEvent = (0, catchAsync_1.default)(async (req, res, next) => {
    const eventId = req.params.id;
    const result = await event_services_1.EventService.deleteEvent(eventId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Event deleted successfully",
        data: result,
    });
});
const updateEvent = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await event_services_1.EventService.updateEvent(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Event updated successfully",
        data: result,
    });
});
exports.EventController = {
    createEvent,
    getEvents,
    getAdminEvents,
    readEvent,
    deleteEvent,
    updateEvent
};
