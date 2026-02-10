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
                message: `A new schedule has been created for ${name} on ${new Date(date).toLocaleDateString()}.`,
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
const approve = async (id, userId, date, email, memberName) => {
    if (!id) {
        throw new error_1.AppError(400, "Id is required");
    }
    // const { subject, text, html } = scheduleApprovedTemplate(name, new Date(date));
    // console.log("schedule", email);
    //   await sendMail({ to: email, subject, text, html });
    const schedule = await appointments_schema_1.default.findById(id).select("name date").lean();
    if (!schedule) {
        throw new error_1.AppError(400, "Schedule not found");
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const viewSchedule = await appointments_schema_1.default.findByIdAndUpdate(id, {
                $set: {
                    status: "approved",
                    isView: true,
                },
            }, { new: true, session });
            if (!viewSchedule) {
                throw new error_1.AppError(400, "Schedule not update");
            }
            const viewNotification = await notification_schema_1.Notification.findOneAndUpdate({ schedule: id, recipient: userId }, { $set: { isRead: true } }, { new: true, session });
            if (!viewNotification) {
                throw new error_1.AppError(400, "Notification not update");
            }
        });
        const { subject, text, html } = (0, scheduleApproved_1.scheduleApprovedTemplate)(schedule?.name, schedule?.date, schedule?.message, memberName);
        await (0, emailHelper_1.sendMail)({ to: email, subject, text, html });
    }
    catch (error) {
        console.log("be a member tarasation error", error);
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
                date: {
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
                date: 1,
                startTime: 1,
                endTime: 1,
                location: 1,
                scheduleType: 1,
                message: 1,
                createdAt: 1,
                approver: 1
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
    getMyMonthlyApprovedSchedules: exports.getMyMonthlyApprovedSchedules
};
