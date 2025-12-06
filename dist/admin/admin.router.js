"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const fileUpload_1 = require("../helper/fileUpload");
const adminRouter = express_1.default.Router();
adminRouter.post("/", admin_controller_1.AdminController.createAdmin);
adminRouter.post("/add-actor", fileUpload_1.fileUploader.upload.single("photo"), admin_controller_1.AdminController.addActor);
adminRouter.put("/:id", admin_controller_1.AdminController.updateActorProfile);
adminRouter.get("/", admin_controller_1.AdminController.getAdmin);
adminRouter.put("/:id", admin_controller_1.AdminController.readNotificaton);
exports.default = adminRouter;
