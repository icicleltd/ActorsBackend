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
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const error_1 = require("../middleware/error");
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
    dob: { type: Date },
    bloodGroup: { type: String },
    // Contact
    email: { type: String },
    password: {
        type: String,
        minlength: 6,
        select: false, // 🔐 do not return password by default
    },
    phoneNumber: { type: String, unique: true },
    whatsApp: { type: String },
    nid: { type: String },
    passport: { type: String },
    // Social Media
    facebookLink: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
    youtubeLink: { type: String },
    youtubeVideos: [{ type: String }],
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
    actorReference: [
        {
            actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Actor", required: true },
            name: { type: String },
            idNo: { type: String },
        },
    ],
    coverImages: [{ type: String }],
    idNo: { type: String, unique: true },
    rank: { type: String },
    rankHistory: [
        {
            rank: { type: String },
            yearRange: { type: String },
            start: { type: Number },
            end: { type: Number },
        },
    ],
    occupation: { type: String },
    actorName: { type: String },
    otherName: { type: String },
    spouse: { type: String },
    bio: { type: String, default: "" },
    fromActive: { type: String },
    endActive: { type: String, default: null },
    presentActive: { type: String, default: null },
    height: { type: String },
    weight: { type: String },
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
    profilePhoto: [
        {
            left: { type: String },
            right: { type: String },
            front: { type: String },
        },
    ],
    photo: {
        type: String,
        default: "https://res.cloudinary.com/dk4ltobvb/image/upload/v1766485148/Actors.png.png",
    },
    characterPhoto: [{ type: String }],
    introVideo: {
        url: { type: String },
        duration: { type: Number, max: 30 },
        sizeMB: { type: Number, max: 100 },
    },
    category: { type: String, enum: ["A", "B", "C"] },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });
// add gard for rank history duplicate added
actorSchema.pre("save", async function () {
    if (!this.rankHistory || this.rankHistory.length < 1) {
        return;
    }
    const seen = new Set();
    for (const entity of this.rankHistory) {
        const key = `${entity.rank}-${entity.yearRange}-${entity.start}-${entity.end}`;
        if (seen.has(key)) {
            throw new error_1.AppError(400, `Duplicate rankHistory entry: rank "${entity.rank}" with yearRange "${entity.yearRange}" already exists`);
        }
        seen.add(key);
    }
    return;
});
// gard when rankhistory update
actorSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();
    let rankHistory = null;
    // Handle $set or direct update (full array replacement)
    if (update.$set?.rankHistory || update.rankHistory) {
        rankHistory = update.$set?.rankHistory || update.rankHistory;
    }
    // Handle $push (adding single entry)
    else if (update.$push?.rankHistory) {
        try {
            const docToUpdate = await this.model.findOne(this.getQuery());
            if (docToUpdate && docToUpdate.rankHistory) {
                const newEntry = update.$push.rankHistory;
                rankHistory = [...docToUpdate.rankHistory, newEntry];
            }
            else {
                // First entry, no duplicates possible
                return;
            }
        }
        catch (error) {
            throw new error_1.AppError(400, `${error}`);
        }
    }
    // No rankHistory update, skip validation
    if (!rankHistory || !Array.isArray(rankHistory)) {
        return;
    }
    const seen = new Set();
    for (const entity of rankHistory) {
        const key = `${entity.rank}-${entity.yearRange}-${entity.start}-${entity.end}`;
        if (seen.has(key)) {
            throw new error_1.AppError(400, `Duplicate rankHistory entry: rank "${entity.rank}" with yearRange "${entity.yearRange}" already exists`);
        }
        seen.add(key);
    }
    return;
});
/* ======================================================
   🔐 PASSWORD HASHING (PRE SAVE)
====================================================== */
actorSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password)
        return;
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
/* ======================================================
   🔐 PASSWORD COMPARE METHOD
====================================================== */
actorSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt_1.default.compare(plainPassword, this.password);
};
const Actor = mongoose_1.default.model("Actor", actorSchema);
exports.default = Actor;
