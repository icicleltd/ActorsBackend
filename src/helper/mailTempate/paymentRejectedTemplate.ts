export const paymentRejectedTemplate = (
  fullName: string,
  year: number,
  message?: string,
): { subject: string; html: string; text: string } => {
  const adminMessage =
    message?.trim() ||
    "Your membership payment could not be verified. Please submit your payment again.";

  return {
    subject: `Your ${year} Actors Equity Payment Was Not Verified`,
    text: `Hello ${fullName},

We're sorry to inform you that your Actors Equity membership payment for ${year} has NOT been verified.

Message from the finance team:
"${adminMessage}"

Please submit your payment again at your earliest convenience to complete your membership process.

Best regards,
Actors Equity`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#dc2626;">Payment Not Verified ❌</h2>

        <p>Hello <strong>${fullName}</strong>,</p>

        <p>
          We're sorry to inform you that your
          <strong>membership payment for ${year}</strong> has
          <strong style="color:#dc2626;">not been verified</strong>.
        </p>

        <div style="
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 12px;
          margin: 16px 0;
        ">
          <p style="margin: 0; font-size: 14px;">
            <strong>Message from the finance team:</strong><br />
            ${adminMessage}
          </p>
        </div>

        <p>
          Please submit your payment again to complete your membership process.
        </p>

        <hr />
        <p style="font-size:12px;color:#6b7280;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };
};