"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeAMemberPaymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
/* ------------------------------------
   BE A MEMBER ROUTES
------------------------------------- */
router.put("/verify/:id", payment_controller_1.BeAMemberPaymentController.verifyPayment);
// Create (Admin)
// Get all (Public/Admin)
router.get("/", payment_controller_1.BeAMemberPaymentController.getBeAMemberPayments);
exports.BeAMemberPaymentRouter = router;
