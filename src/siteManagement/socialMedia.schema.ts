import mongoose, { Schema, Document, Types } from "mongoose";

// Define SocialLink interface
interface ISocialLinkItem {
  _id: Types.ObjectId; // Auto-generated subdocument id
  platform: string; // Platform key, e.g. "facebook", "instagram", "website"
  url: string; // Full URL to the profile/page
}

// Define SocialMedia interface — a single site-wide document, not per-actor
export interface ISocialMedia extends Document {
  links: ISocialLinkItem[]; // Array of social links
  createdAt: Date; // Timestamp for creation
  updatedAt: Date; // Timestamp for last update
}

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
] as const;

// Define SocialLink item schema
const socialLinkItemSchema = new Schema<ISocialLinkItem>({
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
const socialMediaSchema = new Schema<ISocialMedia>(
  {
    links: [socialLinkItemSchema], // Embed the SocialLink schema
  },
  { timestamps: true }
);

// One entry per platform: prevents two "facebook" links existing at once.
socialMediaSchema.index({ "links.platform": 1 }, { unique: true });

// Export SocialMedia model
const SocialMedia = mongoose.model<ISocialMedia>("SocialMedia", socialMediaSchema);
export default SocialMedia;