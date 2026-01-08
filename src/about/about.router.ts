import express from "express";
import { AboutController } from "./about.controller";
import { fileUploader } from "../helper/fileUpload";

const router = express.Router();

/* ------------------------------------
   CREATE ABOUT
------------------------------------ */
router.post(
  "/",
  fileUploader.upload.single("image"),
  AboutController.createAbout
);

/* ------------------------------------
   GET ABOUTS
------------------------------------ */
router.get("/", AboutController.getAbouts);

/* ------------------------------------
   DELETE ABOUT
------------------------------------ */
router.delete("/", AboutController.deleteAbout);
router.put("/", AboutController.updateAbout);

export default router;
