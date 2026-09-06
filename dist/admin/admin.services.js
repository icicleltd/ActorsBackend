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
exports.AdminService = void 0;
const mongoose_1 = require("mongoose");
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const fileUpload_1 = require("../helper/fileUpload");
const senitizePayload_1 = require("../helper/senitizePayload");
const error_1 = require("../middleware/error");
const admin_schema_1 = require("./admin.schema");
const jwtHelper_1 = require("../helper/jwtHelper");
const actor_payment_schema_1 = __importStar(require("../actor payment/actor.payment.schema"));
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
    const sanitize = (0, senitizePayload_1.sanitizePayload)(updatedPayload);
    const result = await actor_schema_1.default.findByIdAndUpdate(actorId, {
        $set: sanitize,
    }, {
        new: true,
        runValidators: true,
    }).select("-password");
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
    // Create the actor in the database
    const actor = await actor_schema_1.default.create(actorProfile);
    if (!actor) {
        throw new error_1.AppError(500, "Failed to create actor");
    }
    return actor;
};
const promoteMember = async (memberData) => {
    const { id, fullName, idNo, rank, rankYear, rankYearRange } = memberData;
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
    return newMember;
};
const deleteMember = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Member id Not found");
    }
    const responce = await actor_schema_1.default.findByIdAndDelete(id);
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
    const filter = {
        $or: fields.map((field) => ({
            [field]: trimmedIdentifier,
            isActive: true,
        })),
    };
    const existing = await admin_schema_1.Admin.findOne(filter)
        .select("+password _id email fullName role")
        .lean(false);
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
        role: existing.role,
        fullName: existing.fullName,
    };
    const accessToken = await jwtHelper_1.jwtHelper.generateToken(data, process.env.ACCESS_TOKEN_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRE_IN);
    if (!accessToken) {
        throw new error_1.AppError(400, "Token not found");
    }
    const userResponse = existing.toObject();
    delete userResponse.password;
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
    const result = await actor_schema_1.default.findByIdAndUpdate(id, {
        $addToSet: {
            gallery: images,
        },
    });
    return result;
};
const deleteImage = async (id, deleteMode, deleteImageId) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new error_1.AppError(400, "Id is not valid");
    }
    if (deleteMode === "all") {
        const result = await actor_schema_1.default.findByIdAndUpdate(id, {
            $pull: {
                gallery: {},
            },
        }, { new: true });
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
    return result;
};
// const fetchActorPayments = async (
//   year: string,
//   status: "pending" | "verified" | "rejected",
//   search: string,
// ) => {
//   console.log(year, status, search);
//   const matchStage: any = {};
//   if (year) {
//     matchStage.year = year;
//   }
//   if (status) {
//     matchStage.status = status;
//   }
//   const pipeline: any[] = [
//     { $match: matchStage },
//     // Join Actor collection
//     {
//       $lookup: {
//         from: "actors",
//         localField: "actor",
//         foreignField: "_id",
//         as: "actor",
//       },
//     },
//     { $unwind: "$actor" },
//   ];
//   // 🔎 Search condition
//   if (search) {
//     pipeline.push({
//       $match: {
//         $or: [
//           { "actor.fullName": { $regex: search, $options: "i" } },
//           { number: { $regex: search, $options: "i" } },
//           { transactionId: { $regex: search, $options: "i" } },
//           // { desc: { $regex: search, $options: "i" } },
//           // { eventName: { $regex: search, $options: "i" } },
//         ],
//       },
//     });
//   }
//   pipeline.push({ $sort: { createdAt: -1 } });
//   const actorPayments = await ActorPayment.aggregate(pipeline);
//   if (!actorPayments || actorPayments.length < 1) {
//     throw new AppError(202, "No actor Payments");
//   }
//   return actorPayments;
// };
const fetchActorPayments = async (year, status, search, limit, skip) => {
    const filter = {};
    if (year) {
        filter.year = year;
    }
    if (status) {
        filter.status = status;
    }
    const [actorPayments, total] = await Promise.all([
        await actor_payment_schema_1.default.find(filter)
            .sort({ createdAt: -1 })
            .populate("actor", "fullName")
            .skip(skip)
            .limit(limit)
            .lean(),
        actor_payment_schema_1.default.countDocuments(),
    ]);
    const totalPages = Math.floor(total / limit);
    return { actorPayments, totalPages };
};
const fetchPaymentHistory = async (year, status, search) => {
    const filter = {};
    if (year) {
        filter.year = year;
    }
    if (status && status !== "all") {
        filter.status = status;
    }
    // if (status === "alllll") {
    //   console.log(" in  all block");
    //   const [paidPayments, pendingPayments] = await Promise.all([
    //     NotifyPayment.find({ status: "request" })
    //       .sort({ createdAt: -1 })
    //       .populate("actorId", "fullName")
    //       .lean(),
    //     ActorPayment.find({ status: "verified" })
    //       .sort({ createdAt: -1 })
    //       .populate("actor", "fullName")
    //       .lean(),
    //   ]);
    //   console.log("paidPayments", "pendingPayments",paidPayments, pendingPayments);
    //   return { paidPayments, pendingPayments };
    // }
    const actorPayments = await actor_payment_schema_1.default.find(filter)
        .sort({ createdAt: -1 })
        .populate("actor", "fullName")
        .lean();
    return actorPayments;
};
const getGroupedYears = async () => {
    const [actorPaymentYears, notifyPaymentYears] = await Promise.all([
        actor_payment_schema_1.default.distinct("year", { type: "membership" }),
        actor_payment_schema_1.NotifyPayment.distinct("year", { type: "membership", }),
    ]);
    const uniqueYears = Array.from(new Set([...actorPaymentYears, ...notifyPaymentYears].map(Number)));
    console.log("uniqueYears", uniqueYears);
    return uniqueYears
        .sort((a, b) => Number(b) - Number(a))
        .map((year) => ({
        label: String(year),
        value: String(year),
    }));
};
const toggleActorStatus = async ({ actorId }) => {
    const updateActor = await actor_schema_1.default.findByIdAndUpdate(actorId, [{ $set: { isActive: { $not: "$isActive" } } }], { new: true, updatePipeline: true });
    console.log(updateActor);
    return updateActor;
};
const getNotifyActorPaidPayment = async (year, status, search, limit, page, skip) => {
    const filter = { status: "paid" };
    if (year) {
        filter.year = year;
    }
    if (status) {
        filter.status = status;
    }
    const [paidNotifyPayments, total] = await Promise.all([
        await actor_payment_schema_1.NotifyPayment.find(filter)
            .sort({ createdAt: -1 })
            .populate("actorId", "fullName")
            .skip(skip)
            .limit(limit)
            .lean(),
        actor_payment_schema_1.default.countDocuments(filter),
    ]);
    const totalPages = Math.floor(total / limit);
    return { paidNotifyPayments, totalPages };
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
    fetchActorPayments,
    getGroupedYears,
    fetchPaymentHistory,
    toggleActorStatus,
    getNotifyActorPaidPayment,
};
