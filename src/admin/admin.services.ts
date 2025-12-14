import Actor from "../actor/actor.schema";
import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
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
  const result = await Actor.findByIdAndUpdate(actorId, actorProfile, {
    new: true,
  });
  if (!result) {
    throw new Error("Failed to fill up actor profile");
  }
  return result;
};
const addActor = async (file: any, actorData: any) => {
  if (!file) {
    throw new AppError(400, "No file provided");
  }

  const uploaded = (await fileUploader.CloudinaryUpload(file)) as {
    secure_url: string;
  };
  if (!uploaded) {
    throw new AppError(500, "Failed to upload file");
  }
  const buildIdNo = actorData.category + "-" + actorData.idNo;
  const actorProfile = {
    phoneNumber: actorData.phoneNumber,
    presentAddress: actorData.presentAddress,
    dob: actorData.dob.toString(),
    bloodGroup: actorData.bloodGroup,
    idNo: buildIdNo,
    fullName: actorData.fullName,
    category: actorData.category,
    status: actorData.status,
    photo: uploaded.secure_url,
    fromActive: actorData.fromActive,
    bio: actorData.bio,
  };
  console.log(actorProfile);
  try {
    const actor = await Actor.create(actorProfile);
    if (!actor) {
      throw new AppError(500, "Failed to create actor");
    }
    return "actor";
  } catch (error) {}
};

const promoteMember = async (memberData: any) => {
  console.log(memberData, "in serveices");
  const { id, fullName, idNo, rank, rankYear, rankYearRange} = memberData;
  if (!id || !fullName || !idNo || !rank) {
    throw new AppError(400, "Member data not provided");
  }
  const newMember = await Actor.findByIdAndUpdate(
    id,
    {
      rank,
      rankYear: rankYear,
      rankYearRange
    },
    { new: true }
  );
  if (!newMember) {
    throw new AppError(500, "Member Not promote");
  }
  console.log(memberData)
  return memberData;
};
export const AdminService = {
  createAdmin,
  addActor,
  getAdmin,
  readAdmin,
  updateActorProfile,
  promoteMember,
};
