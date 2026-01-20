import { SendMailOptions } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface ISendMail {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

import nodemailer, { Transporter } from "nodemailer";
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

export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: ISendMail): Promise<void> => {
  try {
    const mailOptions: SendMailOptions = {
      from: `"Actors Equity" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };
    await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email failed:", error);
  }
};
