import express from "express";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthController.createAuth);
router.get("/", AuthController.getAuths);
router.get("/:id", AuthController.getAdminAuths);
router.put("/:id/read", AuthController.readAuth);

export default router;
