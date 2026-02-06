"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRoutes = void 0;
const express_1 = require("express");
const contact_controller_1 = require("./contact.controller");
const router = (0, express_1.Router)();
router.post("/", contact_controller_1.ContactController.createContact);
router.get("/", contact_controller_1.ContactController.getContacts);
exports.ContactRoutes = router;
