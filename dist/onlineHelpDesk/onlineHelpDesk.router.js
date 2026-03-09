"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpDeskRouter = void 0;
const express_1 = __importDefault(require("express"));
const onlineHelpDesk_controller_1 = require("./onlineHelpDesk.controller");
const router = express_1.default.Router();
router.post("/assign-ticket", onlineHelpDesk_controller_1.HelpDeskController.assignTicket);
router.post("/reply", onlineHelpDesk_controller_1.HelpDeskController.reply);
router.post("/", onlineHelpDesk_controller_1.HelpDeskController.createTicket);
/* ------------------------------------
   Get all tickets (admin / frontend)
------------------------------------- */
router.get("/assign-ticket", onlineHelpDesk_controller_1.HelpDeskController.getAssignTickets);
router.get("/", onlineHelpDesk_controller_1.HelpDeskController.getTickets);
exports.HelpDeskRouter = router;
