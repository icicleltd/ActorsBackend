import { VerifyAdmin } from "../middleware/verifyAdmin";
import express from "express";
import { fileUploader } from "../helper/fileUpload";
import { VerifyLogin } from "../middleware/verifyLogin";
import { SponcerController } from "./sponcer.controller";

const router = express.Router();

router.post("/", VerifyLogin, VerifyAdmin, SponcerController.createSponcer);
router.get("/", SponcerController.getSponcer);
router.put("/:id", SponcerController.editSponsor);
router.delete("/:id",VerifyLogin, VerifyAdmin, SponcerController.deleteSponcer);

export default router;
