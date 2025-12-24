import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { CreateEventDto } from "./event.interface";
import { Event } from "./event.schema";

const createEvent = async (payload: CreateEventDto, files: any) => {
  const { title, description, eventDate, isBookingOpen } = payload;
  if (!files) {
    throw new AppError(400, "File required");
  }
  const uploadArray = async (fileArr: any[]) => {
    if (!fileArr || fileArr.length === 0) return [];
    const uploaded = await fileUploader.CloudinaryUploadMultiple(fileArr);
    return uploaded.map((u: any) => u.secure_url);
  };
  const logo = (await uploadArray(files.logo))[0] || null;
  const banner = (await uploadArray(files.banner))[0] || null;
  const images = (await uploadArray(files.images))[0] || null;
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
    eventDate: eventTime,
    description,
    images,
  });
  return pastEvent;
};

const getEvents = async () => {
  const events = await Event.find({});
  if (!events.length) {
    throw new AppError(204, "No events found");
  }
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
