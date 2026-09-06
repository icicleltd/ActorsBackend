import express from "express";
import * as UserController from "./user.controller";
const userRouter = express.Router();
userRouter.post("/", UserController.makeUser);
userRouter.post("/login", UserController.login);

export const UserRouter = userRouter;
