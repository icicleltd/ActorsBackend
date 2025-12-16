"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const globalErrorHandler_1 = __importDefault(require("./middleware/globalErrorHandler"));
const actor_router_1 = __importDefault(require("./actor/actor.router"));
const admin_router_1 = __importDefault(require("./admin/admin.router"));
const notification_router_1 = __importDefault(require("./notification/notification.router"));
const app = (0, express_1.default)();
// Middleware
const allowedOrigins = ["http://localhost:3000", "https://your-frontend-domain.com"];
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true, // Allow cookies if needed
}));
// // Set custom headers for CORS
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // Replace with your frontend domain
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   next();
// });
// Handle preflight requests
app.options("*", (0, cors_1.default)());
app.use((req, res, next) => {
    console.log("CORS middleware triggered");
    console.log("Request method:", req.method);
    console.log("Request origin:", req.headers.origin);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        console.log("Preflight request handled");
        return res.status(200).end();
    }
    next();
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/v1/actors', actor_router_1.default);
app.use('/api/v1/admin', admin_router_1.default);
app.use('/api/v1/notification', notification_router_1.default);
app.use(globalErrorHandler_1.default);
// Test route
app.get("/", (req, res) => {
    res.send("Server is running with TypeScript!");
});
exports.default = app;
