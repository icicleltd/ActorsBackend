import express from "express";
import { EventController } from "./event.controller";

const router = express.Router();

router.post("/", EventController.createEvent);
router.get("/", EventController.getEvents);
router.get("/:id", EventController.getAdminEvents);
router.put("/:id/read", EventController.readEvent);

export default router;
