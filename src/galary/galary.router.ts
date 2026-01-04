import express from "express";
import { fileUploader } from "../helper/fileUpload";
import { GalleryController } from "./galary.controller";

const router = express.Router();

router.post(
  "/",
  fileUploader.upload.fields([{ name: "images", maxCount: 20 }]),
  GalleryController.createGalleryImages
);

router.get("/", GalleryController.getGalleryImages);

router.delete("/:id", GalleryController.deleteGalleryImage);

router.delete("/", GalleryController.deleteAllGalleryImages);

export default router;
