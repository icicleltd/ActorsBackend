import Actor from "../actor/actor.schema";
import { AppError } from "../middleware/error";
import sendResponse from "../shared/sendResponse";
import { Admin } from "./admin.schema";

const createAdmin = async (payload: any) => {
  if (!payload) {
    throw new AppError(400, "No data provided");
  }
  const newAdmin = await Admin.create(payload);
  if (!newAdmin) {
    throw new AppError(501, "Failed to create admin");
  }
  return {
    adminInfo: newAdmin,
  };
};
const getAdmin = async () => {
  return {
    msg: "Admin fetched",
  };
};
const readAdmin = async () => {
  return {
    msg: "Admin read",
  };
};
const updateActorProfile = async (actorData: any, actorId: string) => {
  if (!actorData) {
    throw new AppError(400, "No actor data provided");
  }
  if (!actorId) {
    throw new AppError(400, "No actor id provided");
  }
  const actorProfile = {
    phoneNumber: actorData.phoneNumber,
    presentAddress: actorData.presentAddress,
    dateOfBirth: new Date(actorData.dateOfBirth),
    bloodGroup: actorData.bloodGroup,
    idNo: actorData.idNo,
    fullName: actorData.fullName,
    category: actorData.category,
    status: actorData.status,
  };
  console.log(actorData);
  const result = await Actor.findByIdAndUpdate(actorId, actorProfile, {
    new: true,
  });
  if (!result) {
    throw new Error("Failed to fill up actor profile");
  }
  return result;
};

export const AdminService = {
  createAdmin,
  getAdmin,
  readAdmin,
  updateActorProfile,
};
