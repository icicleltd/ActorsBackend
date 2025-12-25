import express from "express";
import { AuthController } from "./auth.controller";
import { VerifyLogin } from "../middleware/verifyLogin";

const router = express.Router();

router.post("/login", AuthController.createAuth);
router.get("/me",VerifyLogin, AuthController.getAuths);
router.get("/:id", AuthController.getAdminAuths);
router.put("/:id/read", AuthController.readAuth);

export default router;
