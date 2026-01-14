"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const mongoose_1 = require("mongoose");
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const fileUpload_1 = require("../helper/fileUpload");
const senitizePayload_1 = require("../helper/senitizePayload");
const error_1 = require("../middleware/error");
const admin_schema_1 = require("./admin.schema");
const jwtHelper_1 = require("../helper/jwtHelper");
const createAdmin = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "No data provided");
    }
    const { fullName, email, password, phone, avatar, role } = payload;
    const newAdmin = await admin_schema_1.Admin.create(payload);
    if (!newAdmin) {
        throw new error_1.AppError(501, "Failed to create admin");
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
const updateActorProfile = async (actorData, actorId, file) => {
    if (!actorData) {
        throw new error_1.AppError(400, "No actor data provided");
    }
    if (!actorId) {
        throw new error_1.AppError(400, "No actor id provided");
    }
    let uploadedUrl;
    if (file) {
        const upload = (await fileUpload_1.fileUploader.CloudinaryUpload(file));
        if (!upload) {
            throw new error_1.AppError(500, "Failed to upload file");
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
    console.log("updatedPayload", updatedPayload);
    const sanitize = (0, senitizePayload_1.sanitizePayload)(updatedPayload);
    console.log("sanitize", sanitize);
    const result = await actor_schema_1.default.findByIdAndUpdate(actorId, {
        $set: sanitize,
    }, {
        new: true,
        runValidators: true,
    }).select("-password");
    console.log("result", result);
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
//   console.log(actorProfile);
//   const actor = await Actor.create(actorProfile);
//   if (!actor) {
//     throw new AppError(500, "Failed to create actor");
//   }
//   return actor;
// };
const addActor = async (file, actorData) => {
    let uploadedUrl;
    // Check if a file is provided
    if (file) {
        const uploaded = (await fileUpload_1.fileUploader.CloudinaryUpload(file));
        if (!uploaded) {
            throw new error_1.AppError(500, "Failed to upload file");
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
    console.log(actorProfile);
    // Create the actor in the database
    const actor = await actor_schema_1.default.create(actorProfile);
    if (!actor) {
        throw new error_1.AppError(500, "Failed to create actor");
    }
    console.log(actor);
    return actor;
};
const promoteMember = async (memberData) => {
    const { id, fullName, idNo, rank, rankYear, rankYearRange } = memberData;
    console.log(memberData);
    if (!id || !fullName || !idNo || !rank) {
        throw new error_1.AppError(400, "Member data not provided");
    }
    if (["executive", "advisor"].includes(rank) && !rankYearRange) {
        throw new error_1.AppError(400, "Rank year range is required for advisor and executive");
    }
    const newMember = await actor_schema_1.default.findByIdAndUpdate(id, {
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
    }, { new: true });
    if (!newMember) {
        throw new error_1.AppError(500, "Member Not promote");
    }
    console.log(memberData);
    console.log("new", newMember);
    return newMember;
};
const deleteMember = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Member id Not found");
    }
    const responce = await actor_schema_1.default.findByIdAndDelete(id);
    console.log(responce);
    if (!responce) {
        throw new error_1.AppError(40, "Member not delete");
    }
    return responce;
};
// login admin and super admin //
const login = async (payload) => {
    const { identifier, password, role } = payload;
    if (!identifier || !identifier.trim()) {
        throw new error_1.AppError(400, "Identifier is required");
    }
    if (!password || !password.trim()) {
        throw new error_1.AppError(400, "Password is required");
    }
    if (!role || !role.trim()) {
        throw new error_1.AppError(400, "Role is required");
    }
    const fields = ["email", "phone"];
    const trimmedIdentifier = identifier.trim().toLowerCase();
    console.log(trimmedIdentifier);
    const filter = {
        $or: fields.map((field) => ({
            [field]: trimmedIdentifier,
            isActive: true,
        })),
    };
    const existing = await admin_schema_1.Admin.findOne(filter)
        .select("+password _id email fullName")
        .lean(false);
    console.log("is ", existing);
    if (!existing) {
        throw new error_1.AppError(401, "Unauthorized");
    }
    const isMatch = await existing.comparePassword(password);
    if (!isMatch) {
        throw new error_1.AppError(401, "Invalid Password");
    }
    const data = {
        _id: existing._id,
        email: existing.email,
        role,
        fullName: existing.fullName,
    };
    const accessToken = await jwtHelper_1.jwtHelper.generateToken(data, process.env.ACCESS_TOKEN_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRE_IN);
    if (!accessToken) {
        throw new error_1.AppError(400, "Token not found");
    }
    const userResponse = existing.toObject();
    delete userResponse.password;
    // console.log(data);
    return {
        user: userResponse,
        accessToken,
    };
};
const uploadGallery = async (files, id) => {
    if (!files || !files.images || files.images.length === 0) {
        throw new error_1.AppError(400, "Images are required");
    }
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "Id is not valid");
    }
    const uploaded = await fileUpload_1.fileUploader.CloudinaryUploadMultiple(files.images);
    const images = uploaded.map((u) => ({
        publicId: u.public_id,
        image: u.secure_url,
    }));
    console.log("images", images);
    const result = await actor_schema_1.default.findByIdAndUpdate(id, {
        $addToSet: {
            gallery: images,
        },
    });
    console.log(result);
    return result;
};
const deleteImage = async (id, deleteMode, deleteImageId) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "Id is not valid");
    }
    console.log(id);
    if (deleteMode === "all") {
        const result = await actor_schema_1.default.findByIdAndUpdate(id, {
            $pull: {
                gallery: {},
            },
        }, { new: true });
        console.log(result);
        return result;
    }
    if (!deleteImageId) {
        throw new error_1.AppError(400, "Image id required");
    }
    const result = await actor_schema_1.default.findByIdAndUpdate(id, {
        $pull: {
            gallery: { _id: deleteImageId },
        },
    }, { new: true });
    return result;
};
const makeAdmin = async (payload) => {
    const { userId, role } = payload;
    const existing = await actor_schema_1.default.findById(userId);
    if (!existing?.isActive) {
        throw new error_1.AppError(403, "This member is bloced");
    }
    if (existing.role === role) {
        throw new error_1.AppError(400, `This member is already ${role}`);
    }
    const result = await actor_schema_1.default.findByIdAndUpdate(userId, {
        $set: {
            role,
        },
    }, { new: true, runValidators: true });
    console.log(existing);
    console.log(result);
    return result;
};
const test = async () => {
    return;
};
exports.AdminService = {
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
};
