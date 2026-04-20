export const quoteEmailTemplate = (quote: any): string => {
  const personal = quote.personalInfo ?? {};
  const fullName = `${personal.title ?? ''} ${personal.fastName ?? ''} ${personal.sureName ?? ''}`.trim();
  const product = quote.productId;
  const controller = quote.controller;
  const extra = quote.extra;

  const formatDate = (date?: Date) =>
    date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';

  const quizSection =
    Array.isArray(quote.quizAnswers) && quote.quizAnswers.length
      ? `
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin-top:8px;">
          ${quote.quizAnswers
            .map(
              (qa: any) => `
            <tr>
              <td style="border:1px solid #e2e8f0; background:#f8fafc; width:50%; font-weight:600; color:#374151;">${qa.question}</td>
              <td style="border:1px solid #e2e8f0; color:#4b5563;">${qa.answer}</td>
            </tr>`,
            )
            .join('')}
        </table>`
      : '<p style="color:#6b7280;">No quiz answers provided.</p>';

  const monthlySection = quote.payMounthly && quote.payMounthlyData
    ? `
      <tr>
        <td style="padding:6px 0; color:#6b7280; font-weight:600;">Deposit</td>
        <td style="padding:6px 0; color:#111827;">£${quote.payMounthlyData.deposit ?? 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:6px 0; color:#6b7280; font-weight:600;">Monthly Amount</td>
        <td style="padding:6px 0; color:#111827;">£${quote.payMounthlyData.amount ?? 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:6px 0; color:#6b7280; font-weight:600;">Number of Months</td>
        <td style="padding:6px 0; color:#111827;">${quote.payMounthlyData.mounthNumber ?? 'N/A'}</td>
      </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Quote Summary</title>
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#3b82f6); padding:36px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.5px;">Your Quote Summary</h1>
              <p style="margin:8px 0 0; color:#bfdbfe; font-size:14px;">Thank you for choosing us, ${fullName || 'valued customer'}!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Personal Info -->
              <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Personal Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Full Name</td>
                  <td style="padding:6px 0; color:#111827;">${fullName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Email</td>
                  <td style="padding:6px 0; color:#111827;">${personal.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Mobile</td>
                  <td style="padding:6px 0; color:#111827;">${personal.mobleNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Postcode</td>
                  <td style="padding:6px 0; color:#111827;">${personal.postcode || 'N/A'}</td>
                </tr>
              </table>

              <!-- Product -->
              ${product ? `
              <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Selected Boiler</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Product</td>
                  <td style="padding:6px 0; color:#111827;">${product.title ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Price</td>
                  <td style="padding:6px 0; color:#111827;">£${product.price ?? 'N/A'}</td>
                </tr>
                ${product.payablePrice ? `
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Payable Price</td>
                  <td style="padding:6px 0; color:#16a34a; font-weight:700;">£${product.payablePrice}</td>
                </tr>` : ''}
              </table>` : ''}

              <!-- Controller -->
              ${controller ? `
              <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Controller</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Controller</td>
                  <td style="padding:6px 0; color:#111827;">${controller.title ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Price</td>
                  <td style="padding:6px 0; color:#111827;">£${controller.price ?? 'N/A'}</td>
                </tr>
              </table>` : ''}

              <!-- Extra -->
              ${extra ? `
              <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Extra</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Extra</td>
                  <td style="padding:6px 0; color:#111827;">${extra.title ?? 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Price</td>
                  <td style="padding:6px 0; color:#111827;">£${extra.price ?? 'N/A'}</td>
                </tr>
              </table>` : ''}

              <!-- Installation Details -->
              <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Installation Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Survey Date</td>
                  <td style="padding:6px 0; color:#111827;">${formatDate(quote.surveyDate)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Install Date</td>
                  <td style="padding:6px 0; color:#111827;">${formatDate(quote.installDate)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Install Address</td>
                  <td style="padding:6px 0; color:#111827;">${quote.installAddress || 'N/A'}</td>
                </tr>
              </table>

              <!-- Payment -->
              <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Payment Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Pay by Card</td>
                  <td style="padding:6px 0; color:#111827;">${quote.payByCard ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#6b7280; font-weight:600;">Pay Monthly</td>
                  <td style="padding:6px 0; color:#111827;">${quote.payMounthly ? 'Yes' : 'No'}</td>
                </tr>
                ${monthlySection}
              </table>

              <!-- Quiz Answers -->
              <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Quiz Answers</h2>
              ${quizSection}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0; color:#9ca3af; font-size:13px;">This is an automated quote summary. Please do not reply to this email.</p>
              <p style="margin:8px 0 0; color:#9ca3af; font-size:13px;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};