"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serialCounter_controller_1 = require("./serialCounter.controller");
const router = express_1.default.Router();
/* ------------------------------------
   SERIAL COUNTER ROUTES
------------------------------------- */
// Get next serial when user opens "Be a Member" form
router.post("/", serialCounter_controller_1.SerialCounterController.nextBeAMemberSerial);
router.get("/", serialCounter_controller_1.SerialCounterController.getCurrentBeAMemberSerial);
exports.default = router;
