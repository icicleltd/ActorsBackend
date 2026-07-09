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
// Allowed platform keys — keep in sync with the frontend PLATFORMS list
const ALLOWED_PLATFORMS = [
    "facebook",
    "instagram",
    "twitter",
    "youtube",
    "linkedin",
    "tiktok",
    "whatsapp",
    "website",
];
// Define SocialLink item schema
const socialLinkItemSchema = new mongoose_1.Schema({
    platform: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ALLOWED_PLATFORMS,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
});
// Define SocialMedia schema
const socialMediaSchema = new mongoose_1.Schema({
    links: [socialLinkItemSchema], // Embed the SocialLink schema
}, { timestamps: true });
// One entry per platform: prevents two "facebook" links existing at once.
socialMediaSchema.index({ "links.platform": 1 }, { unique: true });
// Export SocialMedia model
const SocialMedia = mongoose_1.default.model("SocialMedia", socialMediaSchema);
exports.default = SocialMedia;
