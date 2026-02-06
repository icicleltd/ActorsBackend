import { Router } from "express";
import { ContactController } from "./contact.controller";

const router = Router();

router.post("/", ContactController.createContact);
router.get("/", ContactController.getContacts);

export const ContactRoutes = router;
