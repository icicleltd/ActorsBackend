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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const beAMemberSchema = new mongoose_1.Schema({
    // Required
    fullName: { type: String, required: true, trim: true },
    // Basic Info
    motherName: { type: String, required: true, trim: true },
    professionalName: { type: String },
    fatherName: { type: String, required: true, trim: true },
    birthPlace: { type: String, required: true, trim: true },
    presentAddress: { type: String, required: true, trim: true },
    permanentAddress: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    religion: { type: String, required: true, trim: true },
    dob: { type: Date, required: true, trim: true },
    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        required: true,
        trim: true,
    },
    // Contact
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    whatsApp: { type: String, required: true, trim: true },
    nid: { type: String, required: true, trim: true },
    passport: { type: String },
    // Social Media
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    youtubeLink: { type: String },
    youtubeVideos: [{ type: String }],
    actedDramaAndFilmDetails: {
        type: [
            {
                filmAndDramaName: { type: String, required: true },
                characterName: { type: String, required: true },
                directorName: { type: String, required: true },
                broadcastMedium: { type: String, required: true },
            },
        ],
        required: true,
        validate: {
            validator: (v) => v.length >= 10,
            message: "At least 10 acted drama or film details are required",
        },
    },
    educationQualification: { type: String, required: true, trim: true },
    emergencyNumber: { type: String, required: true, trim: true },
    stageAndFilmAdditionalSkills: { type: String, required: true, trim: true },
    actorReference: [
        {
            actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Actor", required: true },
            name: { type: String },
            idNo: { type: String },
        },
    ],
    height: { type: String },
    weight: { type: String },
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment",
    },
    seq: { type: Number },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });
const BeAMember = mongoose_1.default.model("BeAMember", beAMemberSchema);
exports.default = BeAMember;
