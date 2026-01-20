import express from "express";
import { AdminController } from "./admin.controller";
import { fileUploader } from "../helper/fileUpload";
import Actor from "../actor/actor.schema";
const adminRouter = express.Router();
adminRouter.post("/", AdminController.createAdmin);
adminRouter.post(
  "/add-actor",
  fileUploader.upload.single("photo"),
  AdminController.addActor
);
adminRouter.post("/login", AdminController.login);

adminRouter.put("/promote", AdminController.promoteMember);
adminRouter.put("/make-admin", AdminController.makeAdmin);
adminRouter.put(
  "/update-actor/:id",
  fileUploader.upload.single("photo"),
  AdminController.updateActorProfile
);
adminRouter.post(
  "/gallery/:id",
  fileUploader.upload.fields([{ name: "images", maxCount: 20 }]),
  AdminController.uploadGallery
);
adminRouter.delete("/gallery/:id", AdminController.deleteImage);
adminRouter.delete("/deletemember/:id", AdminController.deleteMember);
adminRouter.get("/", AdminController.getAdmin);
adminRouter.put("/update-idno", async (req, res) => {
  const { text } = req.body;

  try {
    if (text !== "idNo") {
      return res.send("no idNo");
    }

    const actors = await Actor.find({
      idNo: { $regex: /^[A-Z]-/ },
    });

    let updatedCount = 0;

    for (const actor of actors) {
      // ✅ TYPE GUARD
      if (!actor.idNo || typeof actor.idNo !== "string") continue;

      const parts = actor.idNo.split("-");
      if (parts.length !== 2) continue;

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
  } catch (err: any) {
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

adminRouter.put("/:id", AdminController.readNotificaton);
// adminRouter.delete("/delete-all", async (req, res) => {
//   const text = req.body.text;
//   
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
export default adminRouter;
