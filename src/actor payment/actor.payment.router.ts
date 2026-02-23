import express from "express";
import { VerifyAdmin } from "../middleware/verifyAdmin";
import { VerifyLogin } from "../middleware/verifyLogin";
import { ActorPaymentController } from "./actor.payment.controller";

const router = express.Router();


// Create (Admin)
router.post("/notify-actor",VerifyLogin,VerifyAdmin, ActorPaymentController.notifyActorForPayment);
router.post("/save-payment/:id",VerifyLogin, ActorPaymentController.paymentSubmitted);
router.post("/verify-payment",VerifyLogin, ActorPaymentController.verifyActorPayment);

// Get all (Public/Admin)
router.get("/notify-actor",VerifyLogin, ActorPaymentController.fetchNotifyPayments);
router.get("/actor-payment",VerifyLogin, ActorPaymentController.fetchActorPayments);
router.get("/payments-stats", ActorPaymentController.getPaymentDashboardStats);
router.get("/", ActorPaymentController.actorPaymentInfo);

// Delete (Admin)
// router.delete(
//   "/:id",
//   VerifyLogin,
//   VerifyAdmin,
//   ActorPaymentController.deleteBeAMember,
// );

export const ActorPayment = router;
