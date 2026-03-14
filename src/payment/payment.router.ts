import express from "express";
import { VerifyAdmin } from "../middleware/verifyAdmin";
import { VerifyLogin } from "../middleware/verifyLogin";
import { BeAMemberPaymentController } from "./payment.controller";

const router = express.Router();

/* ------------------------------------
   BE A MEMBER ROUTES
------------------------------------- */
router.put("/verify/:id", BeAMemberPaymentController.verifyPayment);
// Create (Admin)

// Get all (Public/Admin)
router.get("/", BeAMemberPaymentController.getBeAMemberPayments);


export const BeAMemberPaymentRouter = router;
