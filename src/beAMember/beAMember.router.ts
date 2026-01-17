import express from "express";
import { VerifyAdmin } from "../middleware/verifyAdmin";
import { VerifyLogin } from "../middleware/verifyLogin";
import { BeAMemberController } from "./beAMember.controller";

const router = express.Router();

/* ------------------------------------
   BE A MEMBER ROUTES
------------------------------------- */

// Create (Admin)
router.post(
  "/",
  VerifyLogin,
  VerifyAdmin,
  BeAMemberController.createBeAMember
);

// Get all (Public/Admin)
router.get(
  "/",
  BeAMemberController.getBeAMembers
);

// Delete (Admin)
router.delete(
  "/:id",
  VerifyLogin,
  VerifyAdmin,
  BeAMemberController.deleteBeAMember
);

export default router;
