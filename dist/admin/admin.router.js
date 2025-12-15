"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const fileUpload_1 = require("../helper/fileUpload");
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const adminRouter = express_1.default.Router();
adminRouter.post("/", admin_controller_1.AdminController.createAdmin);
adminRouter.post("/add-actor", fileUpload_1.fileUploader.upload.single("photo"), admin_controller_1.AdminController.addActor);
adminRouter.put("/promote", admin_controller_1.AdminController.promoteMember);
adminRouter.put("/:id", admin_controller_1.AdminController.updateActorProfile);
adminRouter.delete("/delete-member/:id", admin_controller_1.AdminController.deleteMember);
adminRouter.get("/", admin_controller_1.AdminController.getAdmin);
adminRouter.put("/:id", admin_controller_1.AdminController.readNotificaton);
adminRouter.delete("/delete-all", async (req, res) => {
    const text = req.body.text;
    console.log(text);
    try {
        if (text === "delete all") {
            await actor_schema_1.default.deleteMany({});
            res.json({ success: true, message: "All actors deleted" });
        }
        else {
            res.send("no  deleted");
        }
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = adminRouter;
