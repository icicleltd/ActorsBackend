"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
router.post("/login", auth_controller_1.AuthController.createAuth);
router.get("/", auth_controller_1.AuthController.getAuths);
router.get("/:id", auth_controller_1.AuthController.getAdminAuths);
router.put("/:id/read", auth_controller_1.AuthController.readAuth);
exports.default = router;
