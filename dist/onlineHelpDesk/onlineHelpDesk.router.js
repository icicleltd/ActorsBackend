"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpDeskRouter = void 0;
const express_1 = __importDefault(require("express"));
const onlineHelpDesk_controller_1 = require("./onlineHelpDesk.controller");
const router = express_1.default.Router();
/* ------------------------------------
   Create a ticket (actor)
------------------------------------- */
router.post("/", onlineHelpDesk_controller_1.HelpDeskController.createTicket);
/* ------------------------------------
   Get all tickets (admin / frontend)
------------------------------------- */
router.get("/", onlineHelpDesk_controller_1.HelpDeskController.getTickets);
/* ------------------------------------
   Get single ticket by id
------------------------------------- */
router.get("/:id", onlineHelpDesk_controller_1.HelpDeskController.getSingleTicket);
/* ------------------------------------
   Delete single ticket
------------------------------------- */
router.delete("/:id", onlineHelpDesk_controller_1.HelpDeskController.deleteTicket);
/* ------------------------------------
   Delete all tickets (admin)
------------------------------------- */
router.delete("/", onlineHelpDesk_controller_1.HelpDeskController.deleteAllTickets);
exports.HelpDeskRouter = router;
