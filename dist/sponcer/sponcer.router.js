"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const express_1 = __importDefault(require("express"));
const verifyLogin_1 = require("../middleware/verifyLogin");
const sponcer_controller_1 = require("./sponcer.controller");
const router = express_1.default.Router();
router.post("/", verifyLogin_1.VerifyLogin, verifyAdmin_1.VerifyAdmin, sponcer_controller_1.SponcerController.createSponcer);
router.get("/", sponcer_controller_1.SponcerController.getSponcer);
router.delete("/:id", verifyLogin_1.VerifyLogin, verifyAdmin_1.VerifyAdmin, sponcer_controller_1.SponcerController.deleteSponcer);
exports.default = router;
