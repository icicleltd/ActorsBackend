import express from "express";
import { NewsController } from "./news.controller";
import { fileUploader } from "../helper/fileUpload";

const router = express.Router();

router.post(
  "/",
  // fileUploader.upload.single("image"),
  NewsController.createNews
);
router.put(
  "/:id",
  // fileUploader.upload.single("image"),
  NewsController.editNews
);

router.get("/", NewsController.getAllNews);
router.get("/:id", NewsController.getSingleNews);
router.delete("/:id", NewsController.deleteNews);

export default router;
