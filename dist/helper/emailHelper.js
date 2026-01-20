"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.mailTransporter = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
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
const sendMail = async ({ to, subject, text, html, }) => {
    try {
        const mailOptions = {
            from: `"Actors Equity" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        };
        await exports.mailTransporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Email failed:", error);
    }
};
exports.sendMail = sendMail;
