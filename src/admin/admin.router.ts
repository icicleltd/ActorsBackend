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
adminRouter.put("/promote",AdminController.promoteMember)
adminRouter.put("/:id", AdminController.updateActorProfile);
adminRouter.delete("/deletemember/:id", AdminController.deleteMember);
adminRouter.get("/", AdminController.getAdmin);
adminRouter.put("/:id", AdminController.readNotificaton);
adminRouter.delete("/delete-all", async (req, res) => {
  const text = req.body.text;
  console.log(text);
  try {
    if (text === "delete all") {
      await Actor.deleteMany({});
      res.json({ success: true, message: "All actors deleted" });
    } else {
      res.send("no  deleted");
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
export default adminRouter;
