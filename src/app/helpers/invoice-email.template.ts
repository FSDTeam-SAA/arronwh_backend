/**
 * Wraps the invoice HTML in a clean email-safe outer shell.
 * The invoice itself is rendered inline so email clients show it directly.
 */
export function invoiceEmailWrapper(invoiceHtml: string, invoiceNumber: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Invoice from Yolo Heat – ${invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background:#fff;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Pre-header text (hidden in body, shown in email preview) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#fff;">
    Your Yolo Heat invoice ${invoiceNumber} is attached. Thank you for choosing us!
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;padding:30px 0;">
    <tr>
      <td align="center">

        <!-- Invoice HTML embedded -->
        <table width="640" cellpadding="0" cellspacing="0"
               style="background:#fff;overflow:hidden;">
          <tr>
            <td>
              ${invoiceHtml}
            </td>
          </tr>
        </table>

        <!-- Footer note -->
        <table width="640" cellpadding="0" cellspacing="0"
               style="background:#1A2E1A;border-radius:0 0 8px 8px;overflow:hidden;margin-top:2px;">
          <tr>
            <td style="padding:16px 36px;color:#ccc;font-size:11px;text-align:center;">
              © ${new Date().getFullYear()} Yolo Heat Ltd · London, United Kingdom ·
              <a href="mailto:hello@yoloheat.co.uk" style="color:#FBFF26;text-decoration:none;">
                hello@yoloheat.co.uk
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
