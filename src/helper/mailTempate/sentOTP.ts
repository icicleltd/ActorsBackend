export const otpEmailTemplate = (
  name?: string,
  otp?: string,
  expiresAt?: Date, // actual expiration date
): { subject: string; html: string; text: string } => {
  const formattedExpiry = expiresAt
    ? expiresAt.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "30 minutes"; // fallback

  return {
    subject: `Your OTP for Actors Equity Login`,

    text: `Hello ${name || "Member"},

Use the following One-Time Password (OTP) to complete your login:

OTP: ${otp}

This OTP will expire on: ${formattedExpiry}

If you did not request this, please ignore this email.

Actors Equity
`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#6366f1;">Your One-Time Password (OTP)</h2>

        <p>Hello <strong>${name || "Member"}</strong>,</p>

        <p>
          Use the following <strong>OTP</strong> to complete your first-time login:
        </p>

        <div style="
          background-color: #f0f4ff;
          border-left: 4px solid #6366f1;
          padding: 16px;
          margin: 16px 0;
          font-size: 20px;
          font-weight: bold;
          text-align: center;
        ">
          ${otp}
        </div>

        <p>
          This OTP will expire on <strong>${formattedExpiry}</strong>. 
          Please do not share it with anyone.
        </p>

        <hr />
        <p style="font-size:12px;color:#6b7280;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };
};