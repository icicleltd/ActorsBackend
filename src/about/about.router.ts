import express from "express";
import { AboutController } from "./about.controller";
import { fileUploader } from "../helper/fileUpload";

const router = express.Router();

/* ------------------------------------
   CREATE ABOUT
------------------------------------ */
router.post(
  "/",
  fileUploader.upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  AboutController.createAbout
);

/* ------------------------------------
   GET ABOUTS
------------------------------------ */
router.get("/", AboutController.getAbouts);

/* ------------------------------------
   GET ADMIN ABOUTS
------------------------------------ */
router.get("/:id", AboutController.getAdminAbouts);

/* ------------------------------------
   READ ABOUT
------------------------------------ */
router.put("/:id/read", AboutController.readAbout);

/* ------------------------------------
   UPDATE ABOUT
------------------------------------ */
router.put(
  "/:id",
  fileUploader.upload.fields([
    { name: "images", maxCount: 20 },
  ]),
  AboutController.updateAbout
);

/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
router.delete("/:id", AboutController.deleteAbout);

export default router;
