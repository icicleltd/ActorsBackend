import mongoose, { Types } from "mongoose";
import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import Schedule from "./appointments.schema";
import { Notification } from "../notification/notification.schema";
import Actor from "../actor/actor.schema";
import { scheduleApprovedTemplate } from "../helper/mailTempate/scheduleApproved";
import { sendMail } from "../helper/emailHelper";

// validateActorAvailability
const validateActorAvailability = async (
  memberId: string,
  requestedDates: string[],
  session: mongoose.ClientSession,
) => {
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

  const conflictingSchedule = await Schedule.findOne(
    {
      approver: new mongoose.Types.ObjectId(memberId),
      status: { $in: ["pending", "approved"] }, // ignore rejected
      $or: orConditions,
    },
    null,
    { session },
  );
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
      .map((date) =>
        new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      )
      .join(", ");
    throw new AppError(
      409,
      `Actor is already booked on the following date(s): ${formatted}`,
    );
  }
};

/* ------------------------------------
   CREATE / UPDATE SCHEDULE BANNER
------------------------------------- */

const createSchedule = async (payload: any, files: any) => {
  const session = await mongoose.startSession(); // Start a new session for the transaction
  session.startTransaction();

  try {
    const appointmentInfo = JSON.parse(payload.appointment);
    const member = JSON.parse(payload.member);

    if (!appointmentInfo || !member) {
      throw new AppError(400, "appointmentInfo not found");
    }

    let uploaded;
    if (files) {
      uploaded = await fileUploader.UploadThingUploadMultiplePDF(files);
    }

    const pdfLinks = uploaded?.map((pdf: any) => pdf.url);
    console.log("pdlinks",pdfLinks)
    const { dates, phone, email, message, name } = appointmentInfo;
    // ✅ Validate actor availability before creating
    await validateActorAvailability(member.memberId, dates, session);

    // Create a formatted dates string first
    const formattedDates = dates
      .map((date: string) =>
        new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      )
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
    const result = await Schedule.create([appointmentData], { session });
    if (!result || result.length === 0) {
      throw new AppError(500, "Appointment create Failed");
    }
    const notificationResult = await Notification.create(
      [
        {
          recipientRole: ["member", "admin", "superadmin"],
          type: "SCHEDULE",
          title: "New Schedule Created",
          message: `A new schedule has been created for ${name} on ${formattedDates}.`,
          recipient: member.memberId,
          schedule: result[0]._id,
        },
      ],
      {
        session,
      },
    );
    if (!notificationResult || notificationResult.length === 0) {
      throw new AppError(500, "Notification not created");
    }

    // Commit the transaction if everything succeeds
    await session.commitTransaction();
    session.endSession();
    
    return result[0]; // Return the created schedule
  } catch (error) {
    // Rollback the transaction if any operation fails
    await session.abortTransaction();
    session.endSession();

    throw error; // Re-throw the error to handle it in the caller
  }
};

/* ------------------------------------
   GET ALL SCHEDULES
------------------------------------- */
const getSchedules = async (
  sortBy: string = "order",
  sortWith: 1 | -1 = 1,
  approver: string,
  skip: number,
  limit: number,
) => {
  const actorId = await Actor.findOne({ idNo: approver }).select("_id").lean();
  if (!actorId) {
    throw new AppError(400, "This actor not found");
  }

  const [schedules, total] = await Promise.all([
    Schedule.find({ approver: actorId })
      .sort({
        [sortBy]: sortWith,
      })
      .skip(skip)
      .limit(limit),
    Schedule.countDocuments({ approver: actorId }),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { schedules, total, totalPages };
};

// approve request

const approve = async (
  id: string,
  userId: string,
  email: string,
  memberName: string,
) => {
  if (!id) {
    throw new AppError(400, "Id is required");
  }

  // ✅ Added "message" to select since you use it in the template
  const schedule = await Schedule.findById(id)
    .select("name dates message")
    .lean();
    
  if (!schedule) {
    throw new AppError(400, "Schedule not found");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // ✅ Run both updates in parallel — no dependency on each other
      const [viewSchedule, viewNotification] = await Promise.all([
        Schedule.findByIdAndUpdate(
          id,
          { $set: { status: "approved", isView: true } },
          { new: true, session },
        ),
        Notification.findOneAndUpdate(
          { schedule: id, recipient: userId },
          { $set: { isRead: true } },
          { new: true, session },
        ),
      ]);

      if (!viewSchedule) {
        throw new AppError(400, "Schedule not updated");
      }
      if (!viewNotification) {
        throw new AppError(400, "Notification not updated");
      }
    });

    // ✅ Email sent after transaction commits successfully
    const { subject, text, html } = scheduleApprovedTemplate(
      schedule.name,
      schedule.dates,
      schedule.message,
      memberName,
    );

    await sendMail({ to: email, subject, text, html });
  } catch (error) {
    console.log("approve transaction error", error);
    throw new AppError(400, `${error}`);
  } finally {
    session.endSession();
  }
};

export const getMyMonthlyApprovedSchedules = async (
  actorId: Types.ObjectId,
  month: number,
  year: number,
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const schedules = await Schedule.aggregate([
    {
      $match: {
        approver: new Types.ObjectId(actorId), // 🔥 only MY approvals
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
const reorderSchedules = async (items: { id: string; order: number }[]) => {
  if (!Array.isArray(items)) {
    throw new AppError(400, "Invalid reorder payload");
  }

  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { order: item.order },
    },
  }));

  await Schedule.bulkWrite(bulkOps);
  return true;
};

export const ScheduleService = {
  createSchedule,
  getSchedules,
  reorderSchedules,
  approve,
  getMyMonthlyApprovedSchedules,
};
