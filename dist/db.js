"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
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
    }
};
exports.connectDB = connectDB;
