import nodemailer, { Transporter } from "nodemailer";
export const mailTransporter: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // IMPORTANT
  auth: {
    user: "iciclecorpbd@gmail.com",
    pass: "xbal qxhf jkow mkxg",
  },
});
