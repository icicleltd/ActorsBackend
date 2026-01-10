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
adminRouter.post("/login", admin_controller_1.AdminController.login);
adminRouter.put("/promote", admin_controller_1.AdminController.promoteMember);
adminRouter.put("/update-actor/:id", fileUpload_1.fileUploader.upload.single("photo"), admin_controller_1.AdminController.updateActorProfile);
adminRouter.post("/gallery/:id", fileUpload_1.fileUploader.upload.fields([{ name: "images", maxCount: 20 }]), admin_controller_1.AdminController.uploadGallery);
adminRouter.delete("/gallery/:id", admin_controller_1.AdminController.deleteImage);
adminRouter.delete("/deletemember/:id", admin_controller_1.AdminController.deleteMember);
adminRouter.get("/", admin_controller_1.AdminController.getAdmin);
adminRouter.put("/update-idno", async (req, res) => {
    const { text } = req.body;
    try {
        if (text !== "idNo") {
            return res.send("no idNo");
        }
        const actors = await actor_schema_1.default.find({
            idNo: { $regex: /^[A-Z]-/ },
        });
        let updatedCount = 0;
        for (const actor of actors) {
            // ✅ TYPE GUARD
            if (!actor.idNo || typeof actor.idNo !== "string")
                continue;
            const parts = actor.idNo.split("-");
            if (parts.length !== 2)
                continue;
            const [category, rawId] = parts;
            // actor.category = category;
            actor.idNo = rawId;
            await actor.save(); // ✅ IMPORTANT
            updatedCount++;
        }
        return res.json({
            success: true,
            message: "Migration completed",
            updated: updatedCount,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});
// adminRouter.put("/advisor", async (req, res) => {
//   const { text } = req.body;
//   try {
//     if (text !== "adviso") {
//       return res.status(400).json({ message: "no adviso" });
//     }
//     const actorId = "694bcf30f87bce917c8cf0c5";
//     const updatedActor = await Actor.findByIdAndUpdate(
//       actorId,
//       {
//         $set: {
//           "rankHistory.$[item].yearRange": "2025-2028",
//           "rankHistory.$[item].start": 2025,
//           "rankHistory.$[item].end": 2028,
//         },
//       },
//       {
//         new: true,
//         arrayFilters: [{ "item.rank": "advisor" }],
//       }
//     );
//     return res.json({
//       success: true,
//       message: "Rank history updated successfully",
//       updated: updatedActor,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// });
adminRouter.put("/:id", admin_controller_1.AdminController.readNotificaton);
// adminRouter.delete("/delete-all", async (req, res) => {
//   const text = req.body.text;
//   console.log(text);
//   try {
//     if (text === "delete all") {
//       await Actor.deleteMany({});
//       res.json({ success: true, message: "All actors deleted" });
//     } else {
//       res.send("no  deleted");
//     }
//   } catch (err: any) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
exports.default = adminRouter;
