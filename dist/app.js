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
const allowedOrigins = [
    "http://localhost:3000",
    "https://your-frontend-domain.com",
];
// Middleware
app.use(express_1.default.json());
// app.use(cors({
//   origin: "*",
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
// CORS configuration
const corsOptions = {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // Remove credentials if not needed
};
// Use CORS middleware
app.use((0, cors_1.default)(corsOptions));
// Handle preflight OPTIONS requests
app.options("*", (0, cors_1.default)(corsOptions));
// // CORS configuration
// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       "http://localhost:3000", // Local development
//       "https://actors-equity-vfxp.vercel.app", // Deployed frontend
//     ];
//     // Allow requests with no origin (e.g., Postman or server-to-server)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true); // Allow the request
//     } else {
//       callback(new Error("Not allowed by CORS")); // Reject the request
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
//   allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//   credentials: false, // Set to false since no credentials are used
// };
// // Use CORS middleware
// app.use(cors(corsOptions));
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/v1/actors", actor_router_1.default);
app.use("/api/v1/admin", admin_router_1.default);
app.use("/api/v1/notification", notification_router_1.default);
app.use(globalErrorHandler_1.default);
// Test route
app.get("/", (req, res) => {
    res.send("Server is running with TypeScript!");
});
exports.default = app;
