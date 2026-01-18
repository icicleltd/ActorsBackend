import express from "express";
import { SerialCounterController } from "./serialCounter.controller";

const router = express.Router();

/* ------------------------------------
   SERIAL COUNTER ROUTES
------------------------------------- */

// Get next serial when user opens "Be a Member" form
router.post(
  "/",
  SerialCounterController.nextBeAMemberSerial
);

router.get(
  "/",
  SerialCounterController.getCurrentBeAMemberSerial
);

export default router;
