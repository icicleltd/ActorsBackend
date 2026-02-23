"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorPayment = void 0;
const express_1 = __importDefault(require("express"));
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const verifyLogin_1 = require("../middleware/verifyLogin");
const actor_payment_controller_1 = require("./actor.payment.controller");
const router = express_1.default.Router();
// Create (Admin)
router.post("/notify-actor", verifyLogin_1.VerifyLogin, verifyAdmin_1.VerifyAdmin, actor_payment_controller_1.ActorPaymentController.notifyActorForPayment);
router.post("/save-payment/:id", verifyLogin_1.VerifyLogin, actor_payment_controller_1.ActorPaymentController.paymentSubmitted);
router.post("/verify-payment", verifyLogin_1.VerifyLogin, actor_payment_controller_1.ActorPaymentController.verifyActorPayment);
// Get all (Public/Admin)
router.get("/notify-actor", verifyLogin_1.VerifyLogin, actor_payment_controller_1.ActorPaymentController.fetchNotifyPayments);
router.get("/actor-payment", verifyLogin_1.VerifyLogin, actor_payment_controller_1.ActorPaymentController.fetchActorPayments);
router.get("/payments-stats", actor_payment_controller_1.ActorPaymentController.getPaymentDashboardStats);
router.get("/", actor_payment_controller_1.ActorPaymentController.actorPaymentInfo);
// Delete (Admin)
// router.delete(
//   "/:id",
//   VerifyLogin,
//   VerifyAdmin,
//   ActorPaymentController.deleteBeAMember,
// );
exports.ActorPayment = router;
