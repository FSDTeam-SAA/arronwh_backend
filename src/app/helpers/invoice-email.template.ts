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
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Pre-header text (hidden in body, shown in email preview) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#f4f4f0;">
    Your Yolo Heat invoice ${invoiceNumber} is attached. Thank you for choosing us!
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:30px 0;">
    <tr>
      <td align="center">

        <!-- Intro card -->
        <table width="640" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:8px 8px 0 0;overflow:hidden;margin-bottom:2px;">
          <tr>
            <td style="background:#ffff00;padding:20px 36px;font-size:22px;font-weight:900;
                        letter-spacing:-0.5px;color:#1a2e1a;">
              ■ YOLO HEAT &nbsp;
              <span style="font-size:13px;font-weight:400;color:#444;">— Your Invoice is Ready</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 20px;color:#444;font-size:14px;line-height:1.7;">
              <p>Hi there,</p>
              <p style="margin-top:10px;">
                Thank you for choosing <strong>Yolo Heat</strong>. Please find your invoice
                <strong>${invoiceNumber}</strong> below. If you have any questions, don't hesitate
                to get in touch.
              </p>
            </td>
          </tr>
        </table>

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
               style="background:#1a2e1a;border-radius:0 0 8px 8px;overflow:hidden;margin-top:2px;">
          <tr>
            <td style="padding:16px 36px;color:#ccc;font-size:11px;text-align:center;">
              © ${new Date().getFullYear()} Yolo Heat Ltd · London, United Kingdom ·
              <a href="mailto:hello@yoloheat.co.uk" style="color:#ffff00;text-decoration:none;">
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
