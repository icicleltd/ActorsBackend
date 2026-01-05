import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    // Already connected
    return;
  }

  try {
    const db = await mongoose.connect(process.env.DATABASE_URL as string, {
      bufferCommands: false,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};



// fix bufferCommands


// import mongoose from "mongoose";

// // ✅ Load env only in local dev
// if (process.env.NODE_ENV !== "production") {
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   require("dotenv").config();
// }

// const MONGODB_URI = process.env.DATABASE_URL;

// if (!MONGODB_URI) {
//   throw new Error("DATABASE_URL is not defined");
// }

// export const connectDB = async () => {
//   try {
//     // ✅ Already connected
//     if (mongoose.connection.readyState === 1) {
//       return;
//     }

//     // ⏳ Connection in progress
//     if (mongoose.connection.readyState === 2) {
//       await new Promise((resolve) =>
//         mongoose.connection.once("connected", resolve)
//       );
//       return;
//     }

//     // 🔌 New connection
//     await mongoose.connect(MONGODB_URI, {
//       bufferCommands: false,
//       maxPoolSize: 10,
//       serverSelectionTimeoutMS: 5000,
//     });

//     console.log("✅ MongoDB connected");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error);
//     throw error;
//   }
// };


