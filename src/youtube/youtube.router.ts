import { VerifyAdmin } from "./../middleware/verifyAdmin";
import express from "express";
import { fileUploader } from "../helper/fileUpload";
import { YoutubeController } from "./youtube.controller";
import { VerifyLogin } from "../middleware/verifyLogin";

const router = express.Router();

router.post("/", VerifyLogin, VerifyAdmin, YoutubeController.createYoutbe);
router.get("/", YoutubeController.getYoutube);
router.delete("/:id",VerifyLogin, VerifyAdmin, YoutubeController.deleteYoutube);

export default router;
