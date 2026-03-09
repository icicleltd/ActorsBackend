import express from "express";
import { HelpDeskController } from "./onlineHelpDesk.controller";

const router = express.Router();

router.post("/assign-ticket", HelpDeskController.assignTicket);
router.post("/reply", HelpDeskController.reply);
router.post("/", HelpDeskController.createTicket);

/* ------------------------------------
   Get all tickets (admin / frontend)
------------------------------------- */
router.get("/assign-ticket", HelpDeskController.getAssignTickets);
router.get("/", HelpDeskController.getTickets);


export const HelpDeskRouter = router;
