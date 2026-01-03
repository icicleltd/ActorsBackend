import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { CreateEventDto, GetEventsDto } from "./event.interface";
import { Event } from "./event.schema";

const validatePayload = () => {};
const createEvent = async (
  payload: CreateEventDto,
  files: { [fieldname: string]: Express.Multer.File[] }
) => {
  const { title, name, description, eventDate, isBookingOpen } =
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
    // details,
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
  files?: { [fieldname: string]: Express.Multer.File[] }
) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError(404, "Event not found");
  }
  console.log(payload);
  console.log(files);
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
  console.log(updateEvent);
  return updatedEvent;
};

const updateEvent = async (
  id: string,
  payload: any,
  files?: { [fieldname: string]: Express.Multer.File[] }
) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError(404, "Event not found");
  }

  /* -------------------------------
     REQUIRED FIELD VALIDATION
  -------------------------------- */
  const { title, name, description, eventDate } = payload;

  if (!title || !name || !description || !eventDate) {
    throw new AppError(400, "Required fields missing for PUT update");
  }
  const eventTime = new Date(eventDate);
  const isUpcomming = eventTime > new Date();
  /* -------------------------------
     EXISTING IMAGES
  -------------------------------- */
  if (isUpcomming) {
    throw new AppError(
      400,
      "You select future date for event, please select past date."
    );
  }
  let existingImages: string[] = [];

  if (payload.existingImages) {
    existingImages = Array.isArray(payload.existingImages)
      ? payload.existingImages
      : [payload.existingImages];
  }

  /* -------------------------------
     UPLOAD NEW IMAGES
  -------------------------------- */
  const uploadArray = async (files?: Express.Multer.File[]) => {
    if (!files || files.length === 0) return [];
    const uploaded = await fileUploader.CloudinaryUploadMultiple(files);
    return uploaded.map((u: any) => u.secure_url);
  };

  const uploadedImages = await uploadArray(files?.images);

  const finalImages = [...existingImages, ...uploadedImages];

  if (finalImages.length === 0) {
    throw new AppError(400, "At least one image is required");
  }

  /* -------------------------------
     FULL REPLACEMENT (PUT)
  -------------------------------- */
  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    {
      title,
      name,
      description,
      details: payload.details || "",
      eventDate: new Date(eventDate),
      images: finalImages,
    },
    { new: true }
  );
  console.log(updatedEvent);
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
