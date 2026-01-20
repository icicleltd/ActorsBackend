"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const verifyLogin_1 = require("../middleware/verifyLogin");
const beAMember_controller_1 = require("./beAMember.controller");
const router = express_1.default.Router();
/* ------------------------------------
   BE A MEMBER ROUTES
------------------------------------- */
// Create (Admin)
router.post("/", beAMember_controller_1.BeAMemberController.createBeAMember);
// Get all (Public/Admin)
router.get("/", beAMember_controller_1.BeAMemberController.getBeAMembers);
// Delete (Admin)
router.delete("/:id", verifyLogin_1.VerifyLogin, verifyAdmin_1.VerifyAdmin, beAMember_controller_1.BeAMemberController.deleteBeAMember);
exports.default = router;
