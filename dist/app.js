"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = __importDefault(require("./middleware/globalErrorHandler"));
const actor_router_1 = __importDefault(require("./actor/actor.router"));
const admin_router_1 = __importDefault(require("./admin/admin.router"));
const notification_router_1 = __importDefault(require("./notification/notification.router"));
const event_router_1 = __importDefault(require("./event/event.router"));
const auth_router_1 = __importDefault(require("./auth/auth.router"));
const router_1 = __importDefault(require("./dev/router"));
const mediaDirectory_router_1 = __importDefault(require("./mediaDirectory/mediaDirectory.router"));
const galary_router_1 = __importDefault(require("./galary/galary.router"));
const news_router_1 = __importDefault(require("./news/news.router"));
const about_router_1 = __importDefault(require("./about/about.router"));
const banner_router_1 = __importDefault(require("./banner/banner.router"));
const appointments_router_1 = __importDefault(require("./appointments/appointments.router"));
const youtube_router_1 = __importDefault(require("./youtube/youtube.router"));
const sponcer_router_1 = __importDefault(require("./sponcer/sponcer.router"));
const serialCounter_router_1 = __importDefault(require("./serialCounter/serialCounter.router"));
const beAMember_router_1 = __importDefault(require("./beAMember/beAMember.router"));
const siteManagement_router_1 = __importDefault(require("./siteManagement/siteManagement.router"));
const verifyLogin_1 = require("./middleware/verifyLogin");
const dotenv_1 = __importDefault(require("dotenv"));
const contact_router_1 = require("./contact/contact.router");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//cors----------------
// const allowedOrigins = [
//   "*",
//   "http://localhost:3000",
//   "https://your-frontend-domain.com",
// ];
// Middleware
// app.use(cors({
//   origin: allowedOrigins,
//   methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
//   credentials: true, // Allow cookies if needed
// }));
// // Set custom headers for CORS
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // Replace with your frontend domain
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   next();
// });
app.use((req, res, next) => {
    const allowedOrigins = [
        "*",
        "http://localhost:3000", // Local development
        "https://actors-equity-seven.vercel.app", // Deployed frontend 
        "https://actors-equity.vercel.app", // Deployed frontend 
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin); // Dynamically set the origin
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    else {
        res.setHeader("Access-Control-Allow-Origin", "null"); // Reject unauthorized origins
    }
    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});
//-----------cors----------------
//---------router-------------
app.use("/api/v1/actors", actor_router_1.default);
app.use("/api/v1/admin", verifyLogin_1.VerifyLogin, admin_router_1.default);
app.use("/api/v1/notification", notification_router_1.default);
app.use("/api/v1/events", event_router_1.default);
app.use("/", router_1.default);
app.use("/api/v1/auth", auth_router_1.default);
app.use("/api/v1/media-directory", verifyLogin_1.VerifyLogin, mediaDirectory_router_1.default);
app.use("/api/v1/galary", galary_router_1.default);
app.use("/api/v1/news", news_router_1.default);
app.use("/api/v1/about", about_router_1.default);
app.use("/api/v1/banner", banner_router_1.default);
app.use("/api/v1/appointment", appointments_router_1.default);
app.use("/api/v1/youtube", youtube_router_1.default);
app.use("/api/v1/sponcer", sponcer_router_1.default);
app.use("/api/v1/counter", serialCounter_router_1.default);
app.use("/api/v1/be-a-member", beAMember_router_1.default);
app.use("/api/v1/site-management", siteManagement_router_1.default);
app.use("/api/v1/contact", contact_router_1.ContactRoutes);
app.use(globalErrorHandler_1.default);
// Test route
app.get("/", (req, res) => {
    res.send("Server is running with TypeScript!");
});
exports.default = app;
