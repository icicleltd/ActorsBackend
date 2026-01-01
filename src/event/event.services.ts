import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { CreateEventDto, GetEventsDto } from "./event.interface";
import { Event } from "./event.schema";

const validatePayload = () => {};
const createEvent = async (
  payload: CreateEventDto,
  files: { [fieldname: string]: Express.Multer.File[] }
) => {
  const { title, name, details, description, eventDate, isBookingOpen } =
    payload;
  if (!files) {
    throw new AppError(400, "File required");
  }
  const uploadArray = async (fileArr: any[]) => {
    if (!fileArr || fileArr.length === 0) return [];
    const uploaded = await fileUploader.CloudinaryUploadMultiple(fileArr);
    return uploaded.map((u: any) => u.secure_url);
  };
  const [logo, banner, images] = await Promise.all([
    (await uploadArray(files.logo))[0] || null,
    (await uploadArray(files.banner))[0] || null,
    await uploadArray(files.images),
  ]);
  if (!eventDate || !description) {
    throw new AppError(400, "Description and date are required");
  }
  const eventTime = new Date(eventDate);
  const isUpcomming = eventTime > new Date();
  if (isUpcomming) {
    if (!logo || !banner) {
      throw new AppError(400, "Logo and banner are required");
    }

    const upcomming = await Event.create({
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
    throw new AppError(400, "Images are required");
  }
  const pastEvent = await Event.create({
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

const getEvents = async (
  { eventType }: GetEventsDto,
  sortBy: string,
  sortWith: -1 | 1
) => {
  const now = new Date();
  console.log(sortBy, sortWith, "in services");
  let filter: any = {};

  if (eventType === "PAST") {
    filter.eventDate = { $lt: now };
  }

  if (eventType === "UPCOMING") {
    filter.eventDate = { $gte: now };
  }

  const events = await Event.find(filter).sort({ [sortBy ?? "createdAt"]: sortWith });

  if (!events.length) {
    throw new AppError(400, "Event not found");
  }

  return events; // eventType virtual auto included
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
const deleteEvent = async (eventId: string) => {
  if (!eventId) {
    throw new AppError(400, "No event id provided");
  }
  const event = await Event.findByIdAndDelete(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }
  return event;
};

export const EventService = {
  createEvent,
  getEvents,
  getAdminEvents,
  readEvent,
  deleteEvent,
};
