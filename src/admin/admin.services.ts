import { Types } from "mongoose";
import { AllowedActorPayload } from "../actor/actor.interface";
import Actor from "../actor/actor.schema";
import { fileUploader } from "../helper/fileUpload";
import { sanitizePayload } from "../helper/senitizePayload";
import { AppError } from "../middleware/error";
import {
  PayloadAdmin,
  PayloadLoign,
  PayloadMakeAdmin,
} from "./admin.interface";
import { Admin } from "./admin.schema";
import { TokenPayload } from "../auth/auth.interface";
import { jwtHelper } from "../helper/jwtHelper";
import { Secret } from "jsonwebtoken";
import ActorPayment from "../actor payment/actor.payment.schema";

const createAdmin = async (payload: PayloadAdmin) => {
  if (!payload) {
    throw new AppError(400, "No data provided");
  }
  const { fullName, email, password, phone, avatar, role } = payload;
  const newAdmin = await Admin.create(payload);
  if (!newAdmin) {
    throw new AppError(501, "Failed to create admin");
  }

  return newAdmin;
};
const getAdmin = async () => {
  return {
    msg: "Admin fetcheddddddddddd",
  };
};
const readAdmin = async () => {
  return {
    msg: "Admin read",
  };
};

const updateActorProfile = async (
  actorData: AllowedActorPayload,
  actorId: string,
  file: any
) => {
  if (!actorData) {
    throw new AppError(400, "No actor data provided");
  }
  if (!actorId) {
    throw new AppError(400, "No actor id provided");
  }
  let uploadedUrl: string | undefined;
  if (file) {
    const upload = (await fileUploader.CloudinaryUpload(file)) as {
      secure_url: string;
    };
    if (!upload) {
      throw new AppError(500, "Failed to upload file");
    }
    uploadedUrl = upload.secure_url;
  }
  // const buildIdNo = `${actorData.category}-${actorData.idNo}`;
  const actorProfile = {
    phoneNumber: actorData.phoneNumber,
    presentAddress: actorData.presentAddress,
    dob: actorData.dob && new Date(actorData.dob),
    bloodGroup: actorData.bloodGroup,
    // idNo: actorData.idNo,
    fullName: actorData.fullName,
    // category: actorData.category,
    // status: actorData.status,
    photo: uploadedUrl,
    // fromActive: actorData.fromActive,
    bio: actorData.bio,
    email: actorData.email,
    password: actorData.password,
  };
  const updatedPayload = {
    ...actorData,
    photo: uploadedUrl,
  };
  
  const sanitize = sanitizePayload(updatedPayload);
  
  const result = await Actor.findByIdAndUpdate(
    actorId,
    {
      $set: sanitize,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
 
  if (!result) {
    throw new Error("Failed to fill up actor profile");
  }
  return result;
};
// const addActor = async (file: any, actorData: any) => {
//   if (!file) {
//     throw new AppError(400, "No file provided");
//   }

//   const uploaded = (await fileUploader.CloudinaryUpload(file)) as {
//     secure_url: string;
//   };
//   if (!uploaded) {
//     throw new AppError(500, "Failed to upload file");
//   }
//   const buildIdNo = actorData.category + "-" + actorData.idNo;
//   const actorProfile = {
//     phoneNumber: actorData.phoneNumber,
//     presentAddress: actorData.presentAddress,
//     dob: actorData.dob.toString(),
//     bloodGroup: actorData.bloodGroup,
//     idNo: buildIdNo,
//     fullName: actorData.fullName,
//     category: actorData.category,
//     status: actorData.status,
//     photo: uploaded.secure_url,
//     fromActive: actorData.fromActive,
//     bio: actorData.bio,
//   };
//  
//   const actor = await Actor.create(actorProfile);
//   if (!actor) {
//     throw new AppError(500, "Failed to create actor");
//   }
//   return actor;
// };

const addActor = async (file: any, actorData: any) => {
  let uploadedUrl: string | undefined;

  // Check if a file is provided
  if (file) {
    const uploaded = (await fileUploader.CloudinaryUpload(file)) as {
      secure_url: string;
    };

    if (!uploaded) {
      throw new AppError(500, "Failed to upload file");
    }

    uploadedUrl = uploaded.secure_url; // If file uploaded successfully, store the URL
  }
  const buildIdNo = `${actorData.category}-${actorData.idNo}`;
  const actorProfile = {
    phoneNumber: actorData.phoneNumber,
    presentAddress: actorData.presentAddress,
    dob: actorData.dob.toString(),
    bloodGroup: actorData.bloodGroup,
    idNo: buildIdNo,
    fullName: actorData.fullName,
    category: actorData.category,
    status: actorData.status,
    photo: uploadedUrl,
    fromActive: actorData.fromActive,
    bio: actorData.bio,
    email: actorData.email,
    password: actorData.password,
  };

  

  // Create the actor in the database
  const actor = await Actor.create(actorProfile);

  if (!actor) {
    throw new AppError(500, "Failed to create actor");
  }

  return actor;
};

const promoteMember = async (memberData: any) => {
  const { id, fullName, idNo, rank, rankYear, rankYearRange } = memberData;

  if (!id || !fullName || !idNo || !rank) {
    throw new AppError(400, "Member data not provided");
  }
  if (["executive", "advisor"].includes(rank) && !rankYearRange) {
    throw new AppError(
      400,
      "Rank year range is required for advisor and executive"
    );
  }
  const newMember = await Actor.findByIdAndUpdate(
    id,
    {
      $push: {
        rankHistory: {
          rank,
          yearRange: rankYearRange ? rankYearRange.yearRange : "",
          start: rankYearRange?.start || 0,
          end: rankYearRange?.end || 0,
        },
      },
      $set: {
        rankYear,
      },
    },
    { new: true }
  );
  if (!newMember) {
    throw new AppError(500, "Member Not promote");
  }

  return newMember;
};
const deleteMember = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Member id Not found");
  }
  const responce = await Actor.findByIdAndDelete(id);

  if (!responce) {
    throw new AppError(40, "Member not delete");
  }
  return responce;
};
// login admin and super admin //
const login = async (payload: PayloadLoign) => {
  const { identifier, password, role } = payload;

  if (!identifier || !identifier.trim()) {
    throw new AppError(400, "Identifier is required");
  }

  if (!password || !password.trim()) {
    throw new AppError(400, "Password is required");
  }

  if (!role || !role.trim()) {
    throw new AppError(400, "Role is required");
  }

  const fields = ["email", "phone"];
  const trimmedIdentifier = identifier.trim().toLowerCase();
 
  const filter = {
    $or: fields.map((field) => ({
      [field]: trimmedIdentifier,
      isActive: true,
    })),
  };

  const existing = await Admin.findOne(filter)
    .select("+password _id email fullName role")
    .lean(false);
  
  if (!existing) {
    throw new AppError(401, "Unauthorized");
  }

  const isMatch = await existing.comparePassword(password);
  if (!isMatch) {
    throw new AppError(401, "Invalid Password");
  }
  const data: TokenPayload = {
    _id: existing._id,
    email: existing.email,
    role:existing.role,
    fullName: existing.fullName,
  };
  const accessToken = await jwtHelper.generateToken(
    data,
    process.env.ACCESS_TOKEN_SECRET_KEY as Secret,
    process.env.ACCESS_TOKEN_EXPIRE_IN as string
  );
  if (!accessToken) {
    throw new AppError(400, "Token not found");
  }
  const userResponse = existing.toObject();
  delete userResponse.password;
  
  return {
    user: userResponse,
    accessToken,
  };
};
const uploadGallery = async (
  files: {
    [fieldname: string]: Express.Multer.File[];
  },
  id: string
) => {
  if (!files || !files.images || files.images.length === 0) {
    throw new AppError(400, "Images are required");
  }
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Id is not valid");
  }

  const uploaded = await fileUploader.CloudinaryUploadMultiple(files.images);

  const images = uploaded.map((u: any) => ({
    publicId: u.public_id,
    image: u.secure_url,
  }));
 
  const result = await Actor.findByIdAndUpdate(id, {
    $addToSet: {
      gallery: images,
    },
  });
  
  return result;
};
const deleteImage = async (id: string, deleteMode: any, deleteImageId: any) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Id is not valid");
  }
  
  if (deleteMode === "all") {
    const result = await Actor.findByIdAndUpdate(
      id,
      {
        $pull: {
          gallery: {},
        },
      },
      { new: true }
    );
    
    return result;
  }

  if (!deleteImageId) {
    throw new AppError(400, "Image id required");
  }
  const result = await Actor.findByIdAndUpdate(
    id,
    {
      $pull: {
        gallery: { _id: deleteImageId },
      },
    },
    { new: true }
  );
  return result;
};
const makeAdmin = async (payload: PayloadMakeAdmin) => {
  const { userId, role } = payload;
  const existing = await Actor.findById(userId);
  if (!existing?.isActive) {
    throw new AppError(403, "This member is bloced");
  }
  if (existing.role === role) {
    throw new AppError(400, `This member is already ${role}`);
  }
  const result = await Actor.findByIdAndUpdate(
    userId,
    {
      $set: {
        role,
      },
    },
    { new: true, runValidators: true }
  );

  
  return result;
};
const fetchActorPayments = async () => {
  const actorPayments = await ActorPayment.find({
  }).sort({ createdAt: -1 }).populate("actor","fullName").lean();
  if (!actorPayments || actorPayments.length < 1) {
    throw new AppError(202, "No actor Payments");
  }
  return actorPayments;
};
const test = async () => {
  return;
};
export const AdminService = {
  createAdmin,
  addActor,
  getAdmin,
  readAdmin,
  updateActorProfile,
  promoteMember,
  test,
  deleteMember,
  login,
  uploadGallery,
  deleteImage,
  makeAdmin,
  fetchActorPayments
};
