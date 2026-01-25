"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationVerifiedTemplate = void 0;
const applicationVerifiedTemplate = (fullName, message) => {
    const adminMessage = message?.trim() ||
        "Your application has been reviewed and approved by our team.";
    return {
        subject: "Your Actors Equity Membership Has Been Approved",
        text: `Hello ${fullName},

Congratulations!

Your Actors Equity membership application has been APPROVED.

Message from the review team:
"${adminMessage}"

Thank you for being part of our community,
Actors Equity`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#16a34a;">Membership Approved 🎉</h2>

        <p>Hello <strong>${fullName}</strong>,</p>

        <p>
          We’re pleased to inform you that your
          <strong>Actors Equity membership application</strong>
          has been <strong style="color:#16a34a;">approved</strong>.
        </p>

        <div style="
          background-color: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 12px;
          margin: 16px 0;
        ">
          <p style="margin: 0; font-size: 14px;">
            <strong>Message from the review team:</strong><br />
            ${adminMessage}
          </p>
        </div>

      

        // <p style="margin-top: 24px;">
        //   Welcome aboard, and we look forward to working with you.
        // </p>

        <hr />
        <p style="font-size:12px;color:#6b7280;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
    };
};
exports.applicationVerifiedTemplate = applicationVerifiedTemplate;
