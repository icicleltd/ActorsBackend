import express from "express";
import { HelpDeskController } from "./onlineHelpDesk.controller";

const router = express.Router();

/* ------------------------------------
   Create a ticket (actor)
------------------------------------- */
router.post("/", HelpDeskController.createTicket);

/* ------------------------------------
   Get all tickets (admin / frontend)
------------------------------------- */
router.get("/", HelpDeskController.getTickets);

/* ------------------------------------
   Get single ticket by id
------------------------------------- */
router.get("/:id", HelpDeskController.getSingleTicket);

/* ------------------------------------
   Delete single ticket
------------------------------------- */
router.delete("/:id", HelpDeskController.deleteTicket);

/* ------------------------------------
   Delete all tickets (admin)
------------------------------------- */
router.delete("/", HelpDeskController.deleteAllTickets);

export const HelpDeskRouter = router;
