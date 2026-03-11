"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = exports.getMyMonthlyApprovedSchedules = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const appointments_schema_1 = __importDefault(require("./appointments.schema"));
const notification_schema_1 = require("../notification/notification.schema");
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const scheduleApproved_1 = require("../helper/mailTempate/scheduleApproved");
const emailHelper_1 = require("../helper/emailHelper");
// validateActorAvailability
const validateActorAvailability = async (memberId, requestedDates, session) => {
    // Convert requested dates to Date objects (start of day / end of day in UTC)
    const dateRanges = requestedDates.map((date) => {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);
        return { start, end };
    });
    // Build $or query to check if any of the requested dates overlap with existing schedules
    const orConditions = dateRanges.map(({ start, end }) => ({
        dates: {
            $elemMatch: {
                $gte: start,
                $lte: end,
            },
        },
    }));
    const conflictingSchedule = await appointments_schema_1.default.findOne({
        approver: new mongoose_1.default.Types.ObjectId(memberId),
        status: { $in: ["pending", "approved"] }, // ignore rejected
        $or: orConditions,
    }, null, { session });
    if (conflictingSchedule) {
        // Find exactly which dates are conflicting for a helpful error message
        const conflictingDates = requestedDates.filter((reqDate) => {
            const reqStart = new Date(reqDate);
            reqStart.setUTCHours(0, 0, 0, 0);
            const reqEnd = new Date(reqDate);
            reqEnd.setUTCHours(23, 59, 59, 999);
            return conflictingSchedule.dates.some((existingDate) => {
                const d = new Date(existingDate);
                return d >= reqStart && d <= reqEnd;
            });
        });
        const formatted = conflictingDates
            .map((date) => new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }))
            .join(", ");
        throw new error_1.AppError(409, `Actor is already booked on the following date(s): ${formatted}`);
    }
};
/* ------------------------------------
   CREATE / UPDATE SCHEDULE BANNER
------------------------------------- */
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
            uploaded = await fileUpload_1.fileUploader.UploadThingUploadMultiplePDF(files);
        }
        const pdfLinks = uploaded?.map((pdf) => pdf.url);
        console.log("pdlinks", pdfLinks);
        const { dates, phone, email, message, name } = appointmentInfo;
        // ✅ Validate actor availability before creating
        await validateActorAvailability(member.memberId, dates, session);
        // Create a formatted dates string first
        const formattedDates = dates
            .map((date) => new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }))
            .join(", ");
        const appointmentData = {
            dates: dates, //dates.map((date :string)=>new Date(date)) ,
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
                message: `A new schedule has been created for ${name} on ${formattedDates}.`,
                recipient: member.memberId,
                schedule: result[0]._id,
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
const getSchedules = async (sortBy = "order", sortWith = 1, approver, skip, limit) => {
    const actorId = await actor_schema_1.default.findOne({ idNo: approver }).select("_id").lean();
    if (!actorId) {
        throw new error_1.AppError(400, "This actor not found");
    }
    const [schedules, total] = await Promise.all([
        appointments_schema_1.default.find({ approver: actorId })
            .sort({
            [sortBy]: sortWith,
        })
            .skip(skip)
            .limit(limit),
        appointments_schema_1.default.countDocuments({ approver: actorId }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { schedules, total, totalPages };
};
// approve request
const approve = async (id, userId, email, memberName) => {
    if (!id) {
        throw new error_1.AppError(400, "Id is required");
    }
    // ✅ Added "message" to select since you use it in the template
    const schedule = await appointments_schema_1.default.findById(id)
        .select("name dates message")
        .lean();
    if (!schedule) {
        throw new error_1.AppError(400, "Schedule not found");
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            // ✅ Run both updates in parallel — no dependency on each other
            const [viewSchedule, viewNotification] = await Promise.all([
                appointments_schema_1.default.findByIdAndUpdate(id, { $set: { status: "approved", isView: true } }, { new: true, session }),
                notification_schema_1.Notification.findOneAndUpdate({ schedule: id, recipient: userId }, { $set: { isRead: true } }, { new: true, session }),
            ]);
            if (!viewSchedule) {
                throw new error_1.AppError(400, "Schedule not updated");
            }
            if (!viewNotification) {
                throw new error_1.AppError(400, "Notification not updated");
            }
        });
        // ✅ Email sent after transaction commits successfully
        const { subject, text, html } = (0, scheduleApproved_1.scheduleApprovedTemplate)(schedule.name, schedule.dates, schedule.message, memberName);
        await (0, emailHelper_1.sendMail)({ to: email, subject, text, html });
    }
    catch (error) {
        console.log("approve transaction error", error);
        throw new error_1.AppError(400, `${error}`);
    }
    finally {
        session.endSession();
    }
};
const getMyMonthlyApprovedSchedules = async (actorId, month, year) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const schedules = await appointments_schema_1.default.aggregate([
        {
            $match: {
                approver: new mongoose_1.Types.ObjectId(actorId), // 🔥 only MY approvals
                status: "approved",
                dates: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                name: 1, // user name
                phone: 1, // user phone
                email: 1, // user email
                dates: 1,
                startTime: 1,
                endTime: 1,
                location: 1,
                scheduleType: 1,
                message: 1,
                createdAt: 1,
                approver: 1,
            },
        },
        {
            $sort: {
                date: 1,
                startTime: 1,
            },
        },
    ]);
    return {
        totalApproved: schedules.length,
        schedules,
    };
};
exports.getMyMonthlyApprovedSchedules = getMyMonthlyApprovedSchedules;
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
    approve,
    getMyMonthlyApprovedSchedules: exports.getMyMonthlyApprovedSchedules,
};
