"use strict";
// import app from "./app";
// import { connectDB } from "./db";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
// export default async function handler(req: any, res: any) {
//   await connectDB();   // ensure MongoDB is connected
//   return app(req, res); // run Express app
// }
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
const isVercel = process.env.VERCEL === "1";
// --- PRODUCTION: Vercel serverless handler ---
async function handler(req, res) {
    await (0, db_1.connectDB)();
    return (0, app_1.default)(req, res);
}
// --- DEVELOPMENT: local server ---
if (!isVercel) {
    const port = process.env.PORT || 8000;
    const startServer = async () => {
        try {
            await (0, db_1.connectDB)();
            app_1.default.listen(port, () => {
                console.log("🚀 Server running on http://localhost:" + port);
            });
        }
        catch (err) {
            console.error("❌ Failed to start server:", err);
        }
    };
    startServer();
}
