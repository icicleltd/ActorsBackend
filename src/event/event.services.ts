import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { CreateEventDto, GetEventsDto } from "./event.interface";
import { Event } from "./event.schema";

const validatePayload = () => {};
const createEvent = async (payload: CreateEventDto) => {
  const { title, name, description, eventDate, isBookingOpen, images } =
    payload;
  if (images.length < 0) {
    throw new AppError(400, "Images required");
  }

  if (!eventDate || !name) {
    throw new AppError(400, "Name and date are required");
  }
  const eventTime = new Date(eventDate);
  const isUpcomming = eventTime > new Date();
  if (isUpcomming) {
    const upcomming = await Event.create({
      eventDate: eventTime,
      logo: "some",
      banner: "some",
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
    eventDate: eventTime,
    description,
    images,
  });
  return pastEvent;
};

const getEvents = async (
  { eventType }: GetEventsDto,
  sortBy: string,
  sortWith: -1 | 1,
) => {
  const now = new Date();
  let filter: any = {};

  if (eventType === "PAST") {
    filter.eventDate = { $lt: now };
  }

  if (eventType === "UPCOMING") {
    filter.eventDate = { $gte: now };
  }

  const events = await Event.find(filter).sort({
    [sortBy ?? "createdAt"]: sortWith,
  });

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
const updateEventPatch = async (
  id: string,
  payload: any,
  files?: { [fieldname: string]: Express.Multer.File[] },
) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError(404, "Event not found");
  }
  /* ------------------------------------
     EXISTING IMAGES FROM CLIENT
  ------------------------------------- */
  let existingImages: string[] = [];

  if (payload.existingImages) {
    existingImages = Array.isArray(payload.existingImages)
      ? payload.existingImages
      : [payload.existingImages];
  }

  /* ------------------------------------
     UPLOAD NEW IMAGES
  ------------------------------------- */
  const uploadArray = async (fileArr?: Express.Multer.File[]) => {
    if (!fileArr || fileArr.length === 0) return [];
    const uploaded = await fileUploader.CloudinaryUploadMultiple(fileArr);
    return uploaded.map((u: any) => u.secure_url);
  };

  const uploadedImages = await uploadArray(files?.images);

  /* ------------------------------------
     FINAL IMAGE SET
  ------------------------------------- */
  const finalImages = [...existingImages, ...uploadedImages];

  /* ------------------------------------
     PREPARE UPDATE PAYLOAD
  ------------------------------------- */
  const updatePayload: any = {
    title: payload.title,
    name: payload.name,
    description: payload.description,
    details: payload.details,
    eventDate: payload.eventDate
      ? new Date(payload.eventDate)
      : event.eventDate,
    images: finalImages,
  };

  /* ------------------------------------
     UPDATE DB
  ------------------------------------- */
  const updatedEvent = await Event.findByIdAndUpdate(id, updatePayload, {
    new: true,
  });
  return updatedEvent;
};

const updateEvent = async (id: string, payload: CreateEventDto) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError(404, "Event not found");
  }

  /* -------------------------------
     REQUIRED FIELD VALIDATION
  -------------------------------- */
  const { title, name, description, eventDate, images } = payload;

  if (!title || !name || !description || !eventDate) {
    throw new AppError(400, "Required fields missing for PUT update");
  }
  if (images.length === 0) {
    throw new AppError(400, "At least one image is required");
  }
  const eventTime = new Date(eventDate);
  const isUpcomming = eventTime > new Date();
  /* -------------------------------
     EXISTING IMAGES
  -------------------------------- */
  if (isUpcomming) {
    throw new AppError(
      400,
      "You select future date for event, please select past date.",
    );
  }
  // let existingImages: string[] = [];

  // if (payload.existingImages) {
  //   existingImages = Array.isArray(payload.existingImages)
  //     ? payload.existingImages
  //     : [payload.existingImages];
  // }

  /* -------------------------------
     UPLOAD NEW IMAGES
  -------------------------------- */
  // const uploadArray = async (files?: Express.Multer.File[]) => {
  //   if (!files || files.length === 0) return [];
  //   const uploaded = await fileUploader.CloudinaryUploadMultiple(files);
  //   return uploaded.map((u: any) => u.secure_url);
  // };

  // const uploadedImages = await uploadArray(files?.images);

  // const finalImages = [...existingImages, ...uploadedImages];

  // if (finalImages.length === 0) {
  //   throw new AppError(400, "At least one image is required");
  // }

  /* -------------------------------
     FULL REPLACEMENT (PUT)
  -------------------------------- */
  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    {
      title,
      name,
      description,
      eventDate: new Date(eventDate),
      images: images,
    },
    { new: true },
  );
  return updatedEvent;
};

export const EventService = {
  createEvent,
  getEvents,
  getAdminEvents,
  readEvent,
  deleteEvent,
  updateEvent,
};
