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
    fullName: { type: String, required: true }, // ONLY required field
    idNo: { type: String },
    rank: { type: String },
    motherName: { type: String },
    fatherName: { type: String },
    presentAddress: { type: String },
    dob: { type: String },
    bloodGroup: { type: String },
    occupation: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    NID: { type: String },
    passport: { type: String },
    actorName: { type: String },
    otherName: { type: String },
    spouse: { type: String },
    bio: { type: [String], default: [] },
    fromActive: { type: String },
    endActive: { type: String, default: null },
    presentActive: { type: String, default: null },
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    height: { type: String },
    weight: { type: String },
    workExperience: { type: String },
    workSocialMediaInfo: { type: String },
    educationInfo: { type: String },
    personalInfo: { type: String },
    basicInfo: { type: String },
    profilePhoto: [
        {
            left: String,
            right: String,
            front: String,
        },
    ],
    photo: { type: String },
    characterPhoto: [{ type: String }],
    introVideo: {
        url: { type: String },
        duration: {
            type: Number,
            max: 30, // must be <= 30 seconds
        },
        sizeMB: {
            type: Number,
            max: 100, // must be <= 100 MB
        },
    },
    youtubeLink: [{ type: String }],
    category: { enum: ["A", "B"], type: String },
    status: {
        enum: ["pending", "approved", "rejected"],
        type: String,
        default: "pending",
    },
}, { timestamps: true });
const Actor = mongoose_1.default.model("Actor", actorSchema);
exports.default = Actor;
