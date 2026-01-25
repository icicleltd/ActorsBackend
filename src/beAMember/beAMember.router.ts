import express from "express";
import { VerifyAdmin } from "../middleware/verifyAdmin";
import { VerifyLogin } from "../middleware/verifyLogin";
import { BeAMemberController } from "./beAMember.controller";

const router = express.Router();

/* ------------------------------------
   BE A MEMBER ROUTES
------------------------------------- */

// Create (Admin)
router.post("/", BeAMemberController.createBeAMember);

// Get all (Public/Admin)
router.get("/", BeAMemberController.getBeAMembers);
router.put("/update-status/:id",VerifyLogin,VerifyAdmin, BeAMemberController.approveByAdmin);

// Delete (Admin)
router.delete(
  "/:id",
  VerifyLogin,
  VerifyAdmin,
  BeAMemberController.deleteBeAMember,
);

export default router;
