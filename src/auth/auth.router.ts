import express from "express";
import { AuthController } from "./auth.controller";
import { VerifyLogin } from "../middleware/verifyLogin";
import { isRoleChange } from "../middleware/isRolechange";
import { AdminController } from "../admin/admin.controller";

const router = express.Router();

router.post("/login", AuthController.createAuth);
router.post("/create-admin", AdminController.createAdmin);
router.post("/admin-login", AdminController.login);
router.get("/me", VerifyLogin, AuthController.getAuths);
router.get("/:id", AuthController.getAdminAuths);
router.put("/:id/read", AuthController.readAuth);

export default router;
