"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_1 = require("./middleware/error");
dotenv_1.default.config();
let isConnected = false;
const connectDB = async () => {
    if (isConnected) {
        // Already connected
        return;
    }
    try {
        const db = await mongoose_1.default.connect(process.env.DATABASE_URL, {
            bufferCommands: false,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("MongoDB connected");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        throw new error_1.AppError(500, "Mongodb connect error");
    }
};
exports.connectDB = connectDB;
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
