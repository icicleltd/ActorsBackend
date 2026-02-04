import mongoose, { Schema, Document, Types } from "mongoose";

// Define Work interface
interface IWork {
  image: string; // URL or path to the work image
  description: string; // Description of the work
}

// Define Tab interface
interface ITab {
  id: string; // Unique identifier for the tab
  label: string; // Name of the tab
  works: IWork[]; // Array of works associated with the tab
}

// Define Portfolio interface
export interface IPortfolio extends Document {
  actorId: Types.ObjectId; // Reference to Actor
  tabs: ITab[]; // Array of tabs
  createdAt: Date; // Timestamp for creation
  updatedAt: Date; // Timestamp for last update
}

// Define Work schema
const workSchema = new Schema<IWork>({
  image: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
});

// Define Tab schema
const tabSchema = new Schema<ITab>({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  works: [workSchema], // Embed the Work schema
});

// Define Portfolio schema
const portfolioSchema = new Schema<IPortfolio>(
  {
    actorId: {
      type: Schema.Types.ObjectId, // Reference to Actor
      ref: "Actor",
      required: true,
    },
    tabs: [tabSchema], // Embed the Tab schema
  },
  { timestamps: true }
);

// Export Portfolio model
const Portfolio = mongoose.model<IPortfolio>("Portfolio", portfolioSchema);
export default Portfolio;
