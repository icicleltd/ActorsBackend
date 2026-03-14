export const paymentVerifiedTemplate = (
  fullName: string,
  message?: string,
): { subject: string; html: string; text: string } => {
  const adminMessage =
    message?.trim() ||
    "Your membership payment has been successfully verified by our team.";

  return {
    subject: "Your Actors Equity Payment Has Been Verified",
    text: `Hello ${fullName},

Great news!

Your Actors Equity membership payment has been VERIFIED successfully.

Message from the finance team:
"${adminMessage}"

Thank you for completing your membership process.

Best regards,
Actors Equity`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#2563eb;">Payment Verified ✅</h2>

        <p>Hello <strong>${fullName}</strong>,</p>

        <p>
          We’re happy to inform you that your
          <strong>membership payment</strong>
          has been <strong style="color:#2563eb;">successfully verified</strong>.
        </p>

        <div style="
          background-color: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 12px;
          margin: 16px 0;
        ">
          <p style="margin: 0; font-size: 14px;">
            <strong>Message from the finance team:</strong><br />
            ${adminMessage}
          </p>
        </div>

        <hr />
        <p style="font-size:12px;color:#6b7280;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };
};