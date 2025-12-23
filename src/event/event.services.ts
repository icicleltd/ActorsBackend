import { AppError } from "../middleware/error";

const createEvent = async () => {
  return {
    msg: "Event created",
  };
};

const getEvents = async () => {
  // const events = await Event.find({});
  // if (!events.length) {
  //   throw new AppError(204, "No events found");
  // }
  return "events";
};

const getAdminEvents = async (adminId: string) => {
  if (!adminId) {
    throw new AppError(400, "No admin id provided");
  }

  // const events = await Event.find({
  //   recipientId: adminId,
  // });

  // if (!events.length) {
  //   throw new AppError(404, "No events found for this admin");
  // }

  return "events";
};

const readEvent = async (eventId: string) => {
  if (!eventId) {
    throw new AppError(400, "No event id provided");
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

export const EventService = {
  createEvent,
  getEvents,
  getAdminEvents,
  readEvent,
};
