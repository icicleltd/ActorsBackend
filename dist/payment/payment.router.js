"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const verifyLogin_1 = require("../middleware/verifyLogin");
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
/* ------------------------------------
   BE A MEMBER ROUTES
------------------------------------- */
// Create (Admin)
router.post("/", payment_controller_1.BeAMemberController.createBeAMember);
// Get all (Public/Admin)
router.get("/", payment_controller_1.BeAMemberController.getBeAMembers);
// Delete (Admin)
router.delete("/:id", verifyLogin_1.VerifyLogin, verifyAdmin_1.VerifyAdmin, payment_controller_1.BeAMemberController.deleteBeAMember);
exports.default = router;
