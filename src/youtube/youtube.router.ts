import express from "express";
import { fileUploader } from "../helper/fileUpload";
import { YoutubeController } from "./youtube.controller";

const router = express.Router();

router.post("/", YoutubeController.createYoutbe);
router.get("/", YoutubeController.getYoutube);
router.delete("/:id", YoutubeController.deleteYoutube);

export default router;
