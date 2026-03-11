export const scheduleApprovedTemplate = (
  name?: string,
  dates?: Date[],
  message?: string,
  memberName?: string,
): { subject: string; html: string; text: string } => {
  const adminMessage =
    message?.trim() || "Your schedule request has been reviewed and approved.";

  const approverName = memberName || "Actors Equity Admin";

  // ✅ Accept Date[] from DB (Mongoose returns real Date objects)
  const formatDates = (dates?: Date[]): string => {
    if (!dates || dates.length === 0) return "N/A";
    return dates
      .map((date) =>
        new Date(date).toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
          // hour: "2-digit",
          // minute: "2-digit",
          // hour12: true,
        }),
      )
      .join(" | ");
  };
  const formattedDates = formatDates(dates);

  return {
    subject: `Schedule Approved by ${approverName}`,

    text: `Hello ${name || "Member"},

Good news! Your schedule request has been APPROVED.

Schedule Details:
- Date(s): ${formattedDates}
- Approved by: ${approverName}

Message from the review team:
"${adminMessage}"

Please make sure to be available as scheduled.

Actors Equity
`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        
        <h2 style="color:#16a34a; margin-bottom: 8px;">Schedule Approved ✅</h2>

        <p>Hello <strong>${name || "Member"}</strong>,</p>

        <p>
          We're happy to inform you that your
          <strong>schedule request</strong> has been
          <strong style="color:#16a34a;">approved</strong>.
        </p>

        <!-- Approved by + message box -->
        <div style="
          background-color: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 12px 16px;
          margin: 16px 0;
          border-radius: 4px;
        ">
          <p style="margin: 0 0 6px 0; font-size: 15px;">
            <strong>Approved by:</strong> ${approverName}
          </p>
          <p style="margin: 0; font-size: 14px; color: #374151;">
            <strong>Message:</strong> ${adminMessage}
          </p>
        </div>

        <!-- Date(s) table -->
        <table style="width:100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px 12px; text-align: left; border: 1px solid #e5e7eb;">
                Field
              </th>
              <th style="padding: 10px 12px; text-align: left; border: 1px solid #e5e7eb;">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: bold; white-space: nowrap;">
                📅 Scheduled Date(s)
              </td>
              <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">
                ${
                  // ✅ Render each date as its own line in the email
                  dates && dates.length > 0
                    ? dates
                        .map(
                          (date) =>
                            `<div style="margin-bottom: 4px;">• ${new Date(
                              date,
                            ).toLocaleString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              // hour: "2-digit",
                              // minute: "2-digit",
                              // hour12: true,
                            })}</div>`,
                        )
                        .join("")
                    : "N/A"
                }
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: bold;">
                ✅ Approved by
              </td>
              <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">
                ${approverName}
              </td>
            </tr>
          </tbody>
        </table>

        <p style="margin-top: 24px; color: #374151;">
          Please make sure to be available on the scheduled date(s).
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };
};
