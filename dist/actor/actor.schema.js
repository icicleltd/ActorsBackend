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
const actorSchema = new mongoose_1.Schema({
    // Required
    fullName: { type: String, required: true },
    // Basic Info
    motherName: { type: String },
    fatherName: { type: String },
    birthPlace: { type: String },
    presentAddress: { type: String },
    permanentAddress: { type: String },
    nationality: { type: String },
    religion: { type: String },
    dob: { type: String },
    bloodGroup: { type: String },
    // Contact
    email: { type: String },
    phoneNumber: { type: String, unique: true },
    whatsApp: { type: String },
    nid: { type: String },
    passport: { type: String },
    // Social Media
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    youtubeLink: { type: String }, // main youtube profile link
    // YouTube video links
    youtubeVideos: [{ type: String }],
    // Drama / Film Acted Details
    actedDramaAndFilmDetails: [
        {
            filmAndDramaName: { type: String },
            characterName: { type: String },
            directorName: { type: String },
            broadcastMedium: { type: String },
        },
    ],
    educationQualification: { type: String },
    emergencyNumber: { type: String },
    stageAndFilmAdditionalSkills: { type: String },
    // Actor Reference
    actorReference: [
        {
            actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Actor", required: true },
            name: { type: String },
            idNo: { type: String },
        },
    ],
    // Admin Added Member Info
    idNo: { type: String, unique: true },
    rank: { type: String },
    occupation: { type: String },
    actorName: { type: String },
    otherName: { type: String },
    spouse: { type: String },
    bio: { type: String, default: "" },
    fromActive: { type: String },
    endActive: { type: String, default: null },
    presentActive: { type: String, default: null },
    // Physical Info
    height: { type: String },
    weight: { type: String },
    // Work/Personal Info
    workExperience: { type: String },
    workSocialMediaInfo: { type: String },
    educationInfo: { type: String },
    personalInfo: { type: String },
    basicInfo: { type: String },
    rankYearRange: {
        yearRange: { type: String },
        start: { type: Number },
        end: { type: Number },
    },
    rankYear: { type: String },
    // Photos
    profilePhoto: [
        {
            left: { type: String },
            right: { type: String },
            front: { type: String },
        },
    ],
    photo: { type: String, default: "https://ibb.co.com/mFRb3V6g" },
    characterPhoto: [{ type: String }],
    // Intro Video
    introVideo: {
        url: { type: String },
        duration: { type: Number, max: 30 },
        sizeMB: { type: Number, max: 100 },
    },
    // Category & Status
    category: { type: String, enum: ["A", "B"] },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });
const Actor = mongoose_1.default.model("Actor", actorSchema);
exports.default = Actor;
