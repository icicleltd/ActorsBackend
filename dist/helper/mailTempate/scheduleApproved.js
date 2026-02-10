"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleApprovedTemplate = void 0;
const scheduleApprovedTemplate = (name, date, message, memberName) => {
    const adminMessage = message?.trim() || "Your schedule request has been reviewed and approved.";
    const approverName = memberName || "Actors Equity Admin";
    const formattedDate = date
        ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "—";
    return {
        subject: `Schedule Approved by ${memberName}`,
        text: `Hello ${name || "Member"},

Good news!

Your schedule request has been APPROVED.

Schedule details:
Date: ${formattedDate}
Approved by: ${approverName}

Message from the review team:
"${adminMessage}"

Please make sure to be available as scheduled.

Actors Equity
`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#16a34a;">Schedule Approved ✅</h2>

        <p>Hello <strong>${name || "Member"}</strong>,</p>

        <p>
          We’re happy to inform you that your
          <strong>schedule request</strong>
          has been <strong style="color:#16a34a;">approved</strong>.
        </p>

        <div style="
          background-color: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 12px;
          margin: 16px 0;
        ">
         <p style="margin: 0; font-size: 15px;">
            <strong>Approved by:</strong>
            <span style="font-size: 16px;">${memberName}</span>
          </p>
          <p style="margin: 0; font-size: 14px;">
            <strong>Message from the review team:</strong><br />
            ${adminMessage}
          </p>
        </div>

        <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Date</td>
            <td style="padding: 8px;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Approved by</td>
            <td style="padding: 8px;">${approverName}</td>
          </tr>
        </table>

        <p style="margin-top: 24px;">
          Please make sure to be available as scheduled.
        </p>

        <hr />
        <p style="font-size:12px;color:#6b7280;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
    };
};
exports.scheduleApprovedTemplate = scheduleApprovedTemplate;
