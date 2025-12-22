"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const fileUpload_1 = require("../helper/fileUpload");
const error_1 = require("../middleware/error");
const admin_schema_1 = require("./admin.schema");
const createAdmin = async (payload) => {
    if (!payload) {
        throw new error_1.AppError(400, "No data provided");
    }
    const newAdmin = await admin_schema_1.Admin.create(payload);
    if (!newAdmin) {
        throw new error_1.AppError(501, "Failed to create admin");
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
const updateActorProfile = async (actorData, actorId) => {
    if (!actorData) {
        throw new error_1.AppError(400, "No actor data provided");
    }
    if (!actorId) {
        throw new error_1.AppError(400, "No actor id provided");
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
    const result = await actor_schema_1.default.findByIdAndUpdate(actorId, actorProfile, {
        new: true,
    });
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
        photo: uploadedUrl, // Use the uploaded URL if file exists, otherwise Mongoose will use the default value
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
    console.log(memberData, "in serveices");
    const { id, fullName, idNo, rank, rankYear, rankYearRange } = memberData;
    if (!id || !fullName || !idNo || !rank) {
        throw new error_1.AppError(400, "Member data not provided");
    }
    const newMember = await actor_schema_1.default.findByIdAndUpdate(id, {
        rank,
        rankYear: rankYear,
        rankYearRange,
    }, { new: true });
    if (!newMember) {
        throw new error_1.AppError(500, "Member Not promote");
    }
    console.log(memberData);
    return memberData;
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
};
