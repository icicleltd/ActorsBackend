import Actor from "../actor/actor.schema";
import { deleteFromCloudinary } from "../helper/fileUpload";
import { AppError } from "../middleware/error";

/* ------------------------------------
   CREATE BE A MEMBER
------------------------------------- */
const createBeAMember = async (payload: { url: string }) => {
  const { url } = payload;

  if (!url) {
    throw new AppError(400, "URL is required");
  }

  const result = await Actor.create({});

  if (!result) {
    throw new AppError(400, "Be a Member entry not created");
  }

  return result;
};

/* ------------------------------------
   GET ALL BE A MEMBERS
------------------------------------- */
const getBeAMembers = async () => {
  const members = await Actor.find().sort({ createdAt: -1 });
  return members;
};

/* ------------------------------------
   DELETE SINGLE BE A MEMBER
------------------------------------- */
const deleteBeAMember = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Be a Member ID is required");
  }

  const member = await Actor.findById(id);

  if (!member) {
    throw new AppError(404, "Be a Member entry not found");
  }

  // If you later store publicId, uncomment this
  // await deleteFromCloudinary(member.publicId);

  await Actor.findByIdAndDelete(id);

  return member;
};

/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
export const BeAMemberService = {
  createBeAMember,
  getBeAMembers,
  deleteBeAMember,
};
