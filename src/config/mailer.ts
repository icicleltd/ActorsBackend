import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const mailTransporter: Transporter = nodemailer.createTransport({
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
