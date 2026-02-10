import mongoose, { Types } from "mongoose";
import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import Schedule from "./appointments.schema";
import { Notification } from "../notification/notification.schema";
import Actor from "../actor/actor.schema";
import { scheduleApprovedTemplate } from "../helper/mailTempate/scheduleApproved";
import { sendMail } from "../helper/emailHelper";

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
      uploaded = await fileUploader.CloudinaryUploadMultiplePDF(files);
    }

    const pdfLinks = uploaded?.map((pdf: any) => pdf.secure_url as string);
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
          message: `A new schedule has been created for ${name} on ${new Date(date).toLocaleDateString()}.`,
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
  date: string,
  email: string,
  memberName: string,
) => {
  if (!id) {
    throw new AppError(400, "Id is required");
  }
  // const { subject, text, html } = scheduleApprovedTemplate(name, new Date(date));
  // console.log("schedule", email);
  //   await sendMail({ to: email, subject, text, html });
  const schedule = await Schedule.findById(id).select("name date").lean();
  if (!schedule) {
    throw new AppError(400, "Schedule not found");
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const viewSchedule = await Schedule.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "approved",
            isView: true,
          },
        },
        { new: true, session },
      );
      if (!viewSchedule) {
        throw new AppError(400, "Schedule not update");
      }
      const viewNotification = await Notification.findOneAndUpdate(
        { schedule: id, recipient: userId },
        { $set: { isRead: true } },
        { new: true, session },
      );
      if (!viewNotification) {
        throw new AppError(400, "Notification not update");
      }
    });
    const { subject, text, html } = scheduleApprovedTemplate(
      schedule?.name,
      schedule?.date,
      schedule?.message,
      memberName,
    );

    await sendMail({ to: email, subject, text, html });
  } catch (error) {
    console.log("be a member tarasation error", error);
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
        approver: new Types.ObjectId(actorId),       // 🔥 only MY approvals
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
        name: 1,        // user name
        phone: 1,       // user phone
        email: 1,       // user email
        date: 1,
        startTime: 1,
        endTime: 1,
        location: 1,
        scheduleType: 1,
        message: 1,
        createdAt: 1,
        approver:1
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
  getMyMonthlyApprovedSchedules
};
