"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const event_schema_1 = require("./event.schema");
const validatePayload = () => { };
const createEvent = async (payload, files) => {
    const { title, name, details, description, eventDate, isBookingOpen } = payload;
    if (!files) {
        throw new error_1.AppError(400, "File required");
    }
    const uploadArray = async (fileArr) => {
        if (!fileArr || fileArr.length === 0)
            return [];
        const uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(fileArr);
        return uploaded.map((u) => u.secure_url);
    };
    const [logo, banner, images] = await Promise.all([
        (await uploadArray(files.logo))[0] || null,
        (await uploadArray(files.banner))[0] || null,
        (await uploadArray(files.images)),
    ]);
    if (!eventDate || !description) {
        throw new error_1.AppError(400, "Description and date are required");
    }
    console.log(images);
    const eventTime = new Date(eventDate);
    const isUpcomming = eventTime > new Date();
    if (isUpcomming) {
        if (!logo || !banner) {
            throw new error_1.AppError(400, "Logo and banner are required");
        }
        const upcomming = await event_schema_1.Event.create({
            eventDate: eventTime,
            logo,
            banner,
            description,
            isBookingOpen: isBookingOpen ?? true,
            registrationCount: 0,
        });
        return upcomming;
    }
    if (!images || images.length === 0) {
        throw new error_1.AppError(400, "Images are required");
    }
    const pastEvent = await event_schema_1.Event.create({
        name,
        title,
        details,
        eventDate: eventTime,
        description,
        images,
    });
    console.log(pastEvent);
    return pastEvent;
};
const getEvents = async () => {
    const events = await event_schema_1.Event.find({});
    if (!events.length) {
        throw new error_1.AppError(204, "No events found");
    }
    return "events";
};
const getAdminEvents = async (adminId) => {
    if (!adminId) {
        throw new error_1.AppError(400, "No admin id provided");
    }
    // const events = await Event.find({
    //   recipientId: adminId,
    // });
    // if (!events.length) {
    //   throw new AppError(404, "No events found for this admin");
    // }
    return "events";
};
const readEvent = async (eventId) => {
    if (!eventId) {
        throw new error_1.AppError(400, "No event id provided");
    }
    // const event = await Event.findByIdAndUpdate(
    //   eventId,
    //   { isRead: true },
    //   { new: true }
    // );
    // if (!event) {
    //   throw new AppError(404, "Event not found");
    // }
    return "event";
};
exports.EventService = {
    createEvent,
    getEvents,
    getAdminEvents,
    readEvent,
};
