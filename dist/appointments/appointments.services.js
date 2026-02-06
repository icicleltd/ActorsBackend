"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const appointments_schema_1 = __importDefault(require("./appointments.schema"));
const notification_schema_1 = require("../notification/notification.schema");
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
/* ------------------------------------
   CREATE / UPDATE SCHEDULE BANNER
------------------------------------- */
// const createSchedule = async (payload: any, files: any) => {
//   const appointmentInfo = JSON.parse(payload.appointment);
//   const member = JSON.parse(payload.member);
//   if (!appointmentInfo || !member) {
//     throw new AppError(400, "Appointment info required");
//   }
//   let uploaded;
//   if (files) {
//     uploaded = await fileUploader.CloudinaryUploadMultiplePDF(files);
//   }
//   const pdfLinks = uploaded?.map((pdf: any) => pdf.secure_url as string);
//   const { date, phone, email, message, name } = appointmentInfo;
//   const appointmentData = {
//     date: new Date(date),
//     name,
//     phone,
//     email,
//     message,
//     approver: member.memberId,
//     pdfLinks,
//   };
//   const result = await Schedule.create(appointmentData);
//   if (!result) {
//     throw new AppError(500, "Not created appointmentData");
//   }
//   return result;
// };
// Upload image (if provided)
//   const uploadResult = await fileUploader.CloudinaryUpload(file);
//   schedule = await Schedule.findOneAndUpdate(
//     {},
//     {
//       title,
//       description,
//       imageUrl: uploadResult.secure_url,
//       publicId: uploadResult.public_id,
//     },
//     {
//       new: true,
//       upsert: true,
//     }
//   );
//   return schedule;
// };
const createSchedule = async (payload, files) => {
    const session = await mongoose_1.default.startSession(); // Start a new session for the transaction
    session.startTransaction();
    try {
        const appointmentInfo = JSON.parse(payload.appointment);
        const member = JSON.parse(payload.member);
        if (!appointmentInfo || !member) {
            throw new error_1.AppError(400, "appointmentInfo not found");
        }
        let uploaded;
        if (files) {
            uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiplePDF(files);
        }
        const pdfLinks = uploaded?.map((pdf) => pdf.secure_url);
        const { date, phone, email, message, name } = appointmentInfo;
        const appointmentData = {
            date: new Date(date),
            name,
            phone,
            email,
            message,
            approver: member.memberId,
            pdfLinks,
        };
        // Create the schedule inside the transaction
        const result = await appointments_schema_1.default.create([appointmentData], { session });
        if (!result || result.length === 0) {
            throw new error_1.AppError(500, "Appointment create Failed");
        }
        const notificationResult = await notification_schema_1.Notification.create([
            {
                recipientRole: ["member", "admin", "superadmin"],
                type: "SCHEDULE",
                title: "New Schedule Created",
                message: `A new schedule has been created for ${name} on ${date}.`,
                recipient: member.memberId,
            },
        ], {
            session,
        });
        if (!notificationResult || notificationResult.length === 0) {
            throw new error_1.AppError(500, "Notification not created");
        }
        // Commit the transaction if everything succeeds
        await session.commitTransaction();
        session.endSession();
        return result[0]; // Return the created schedule
    }
    catch (error) {
        // Rollback the transaction if any operation fails
        await session.abortTransaction();
        session.endSession();
        throw error; // Re-throw the error to handle it in the caller
    }
};
/* ------------------------------------
   GET ALL SCHEDULES
------------------------------------- */
const getSchedules = async (sortBy = "order", sortWith = 1, approver) => {
    const actorId = await actor_schema_1.default.findOne({ idNo: approver }).select("_id").lean();
    if (!actorId) {
        throw new error_1.AppError(400, "This actor not found");
    }
    const schedules = await appointments_schema_1.default.find({ approver: actorId }).sort({
        [sortBy]: sortWith,
    });
    return schedules;
};
/* ------------------------------------
   DELETE SINGLE SCHEDULE
------------------------------------- */
// const deleteSchedule = async (id: string) => {
//   if (!id) {
//     throw new AppError(400, "Schedule id is required");
//   }
//   const schedule = await Schedule.findById(id);
//   if (!schedule) {
//     throw new AppError(404, "Schedule not found");
//   }
//   if (schedule.publicId) {
//     await deleteFromCloudinary(schedule.publicId);
//   }
//   await Schedule.findByIdAndDelete(id);
//   return schedule;
// };
/* ------------------------------------
   DELETE ALL SCHEDULES
------------------------------------- */
// const deleteAllSchedules = async () => {
//   const schedules = await Schedule.find();
//   for (const schedule of schedules) {
//     if (schedule.publicId) {
//       await deleteFromCloudinary(schedule.publicId);
//     }
//   }
//   const result = await Schedule.deleteMany({});
//   return result;
// };
/* ------------------------------------
   REORDER SCHEDULES
------------------------------------- */
const reorderSchedules = async (items) => {
    if (!Array.isArray(items)) {
        throw new error_1.AppError(400, "Invalid reorder payload");
    }
    const bulkOps = items.map((item) => ({
        updateOne: {
            filter: { _id: item.id },
            update: { order: item.order },
        },
    }));
    await appointments_schema_1.default.bulkWrite(bulkOps);
    return true;
};
exports.ScheduleService = {
    createSchedule,
    getSchedules,
    reorderSchedules,
};
