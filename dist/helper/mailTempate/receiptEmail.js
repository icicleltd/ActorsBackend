"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReceiptEmailHtml = void 0;
const formatYearsList = (years) => years
    .split(",")
    .map((y) => y.trim())
    .filter(Boolean)
    .map(Number)
    .sort((a, b) => a - b)
    .join(", ");
const formatDate = (date) => date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const buildReceiptEmailHtml = (data) => {
    const serial = `AEB-${Date.now().toString().slice(-6)}`;
    const navy = "#1a3a6b";
    const pink = "#d63384";
    const green = "#2ecc71";
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color:${navy}; padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0; color:#ffffff; font-size:18px; font-weight:bold; letter-spacing:0.5px;">
                      ACTORS EQUITY BANGLADESH
                    </p>
                    <p style="margin:4px 0 0; color:#cbd5e1; font-size:12px;">
                      House # 110, Road # 2, Block # A, Niketon, Gulshan-1, Dhaka
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td style="padding:28px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1a73c8; border-radius:6px; padding:8px 20px;">
                    <span style="color:#ffffff; font-size:13px; font-weight:bold; letter-spacing:0.5px;">
                      PAYMENT RECEIPT
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0; color:#111827; font-size:14px; line-height:1.6;">
                Dear <strong>${data.name}</strong>,
              </p>
              <p style="margin:8px 0 0; color:#4b5563; font-size:13px; line-height:1.6;">
                We have received your membership fee payment. Details of the transaction are below.
              </p>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
                ${row("Serial No.", serial)}
                ${row("Date", formatDate(new Date()))}
                ${row("Name", data.name)}
                ${row("Member ID", data.idNo)}
                ${row("Description", data.title)}
                ${row("Paid Years", formatYearsList(data.allYear))}
                ${row("Amount (in words)", data.amountInWord)}
                ${row("Amount (Tk.)", `৳ ${data.totalAmount.toLocaleString("en-BD")}`, true)}
              </table>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0; color:#6b7280; font-size:12px; line-height:1.6;">
                This is a computer-generated receipt and does not require a signature. If you have any questions about this payment, please contact us at
                <a href="mailto:info@actorsequitybd.com" style="color:${navy}; text-decoration:none;">info@actorsequitybd.com</a>.
              </p>
            </td>
          </tr>

          <!-- Bottom stripe -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr style="height:6px;">
                  <td width="50%" style="background-color:${navy}; height:6px; line-height:6px; font-size:0;">&nbsp;</td>
                  <td width="25%" style="background-color:${pink}; height:6px; line-height:6px; font-size:0;">&nbsp;</td>
                  <td width="25%" style="background-color:${green}; height:6px; line-height:6px; font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 0; color:#9ca3af; font-size:11px;">
          © ${new Date().getFullYear()} Actors Equity Bangladesh. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
exports.buildReceiptEmailHtml = buildReceiptEmailHtml;
const row = (label, value, isLast = false) => `
  <tr>
    <td style="padding:10px 16px; font-size:12px; font-weight:bold; color:#374151; background-color:#f9fafb; width:170px; ${isLast ? "" : "border-bottom:1px solid #e5e7eb;"}">
      ${label}
    </td>
    <td style="padding:10px 16px; font-size:13px; color:#111827; ${isLast ? "" : "border-bottom:1px solid #e5e7eb;"}">
      ${value}
    </td>
  </tr>`;
