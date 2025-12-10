import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import actorRouter from "./actor/actor.router";
import adminRouter from "./admin/admin.router";
import notificationRouter from "./notification/notification.router";

const app = express();

// Middleware
const allowedOrigins = ["http://localhost:3000", "https://your-frontend-domain.com"];
// Middleware
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
  credentials: true, // Allow cookies if needed
}));
// Set custom headers for CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Replace with your frontend domain
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/actors',actorRouter)
app.use('/api/v1/admin',adminRouter)
app.use('/api/v1/notification',notificationRouter)
app.use(globalErrorHandler);



// Test route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running with TypeScript!");
});

export default app;
