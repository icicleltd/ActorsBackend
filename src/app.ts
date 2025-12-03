import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import actorRouter from "./actor/actor.router";
import adminRouter from "./admin/admin.router";
import notificationRouter from "./notification/notification.router";

const app = express();

// Middleware
app.use(express.json());
app.use(cors())
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
