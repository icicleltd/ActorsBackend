export const applicationSubmittedTemplate = (
  fullName: string,
): { subject: string; html: string; text: string } => {
  return {
    subject: "Application Submitted Successfully",
    text: `Hello ${fullName},

Your Actors Equity membership application has been submitted successfully.
Current status: PENDING

Our team will review your application after payment verification and reference approvals.

Thank you,
Actors Equity`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#0f172a;">Application Submitted Successfully</h2>
        <p>Hello <strong>${fullName}</strong>,</p>

        <p>
          Your <strong>Actors Equity membership application</strong> has been
          submitted successfully.
        </p>

        <p>
          <strong>Status:</strong>
          <span style="color:#f59e0b;">Pending Review</span>
        </p>

        <p>
          Our team will verify your payment and collect approvals from your
          listed references.
        </p>

        <p style="margin-top: 24px;">
          Thank you for your interest in Actors Equity.
        </p>

        <hr />
        <p style="font-size:12px;color:#6b7280;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };
};
