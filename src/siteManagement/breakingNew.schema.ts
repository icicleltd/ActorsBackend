import mongoose, { Schema } from "mongoose";

export interface IBreakingNews {
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Portfolio schema
const breakingNewsSchema = new Schema<IBreakingNews>(
  {
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Export Portfolio model
const BreakingNews = mongoose.model<IBreakingNews>("BreakingNews", breakingNewsSchema);
export default BreakingNews;
