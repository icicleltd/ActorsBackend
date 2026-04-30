"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.mailTransporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // IMPORTANT
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        // user: "iciclecorpbd@gmail.com",
        // pass: "xbal qxhf jkow mkxg",
    },
});
