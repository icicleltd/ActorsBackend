"use strict";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
// let isConnected = false;
// export const connectDB = async () => {
//   if (isConnected) {
//     // Already connected
//     return;
//   }
//   try {
//     const db = await mongoose.connect(process.env.DATABASE_URL as string, {
//       bufferCommands: false,
//     });
//     isConnected = db.connections[0].readyState === 1;
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("MongoDB connection failed:", error);
//   }
// };
// fix bufferCommands
const mongoose_1 = __importDefault(require("mongoose"));
// ✅ Load env only in local dev
if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config();
}
const MONGODB_URI = process.env.DATABASE_URL;
if (!MONGODB_URI) {
    throw new Error("DATABASE_URL is not defined");
}
const connectDB = async () => {
    try {
        // ✅ Already connected
        if (mongoose_1.default.connection.readyState === 1) {
            return;
        }
        // ⏳ Connection in progress
        if (mongoose_1.default.connection.readyState === 2) {
            await new Promise((resolve) => mongoose_1.default.connection.once("connected", resolve));
            return;
        }
        // 🔌 New connection
        await mongoose_1.default.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ MongoDB connected");
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        throw error;
    }
};
exports.connectDB = connectDB;
