import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import Schedule from "./appointments.schema";

/* ------------------------------------
   CREATE / UPDATE SCHEDULE BANNER
------------------------------------- */
const createSchedule = async (payload: any) => {
  console.log(payload);
  let schedule;
};

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

/* ------------------------------------
   GET ALL SCHEDULES
------------------------------------- */
const getSchedules = async (sortBy: string = "order", sortWith: 1 | -1 = 1) => {
  const schedules = await Schedule.find().sort({ [sortBy]: sortWith });
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
};
