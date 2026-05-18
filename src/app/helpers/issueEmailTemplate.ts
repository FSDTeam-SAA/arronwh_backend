import { CreateIssueDto } from '../module/issue/dto/create-issue.dto';

const escapeHtml = (value?: string) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const issueEmailTemplate = (issue: CreateIssueDto): string => {
  const submittedAt = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
  });

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Issue Submitted</title>
  </head>
  <body style="margin:0;padding:0;background:#EAEBEC;font-family:Arial,Helvetica,sans-serif;color:#1A2E1A;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#EAEBEC;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:100%;background:#ffffff;border:1px solid #d6d8da;">
            <tr>
              <td style="background:#EAEBEC;padding:22px 30px;">
                <div style="color:#1A2E1A;font-size:20px;font-weight:900;letter-spacing:-0.5px;">
                  - YOLO HEAT
                </div>
                <div style="margin-top:8px;color:#4b5a4d;font-size:12px;line-height:18px;">
                  London, United Kingdom &middot; hello@yoloheat.co.uk
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#FBFF26;padding:28px 30px;">
                <h1 style="margin:0;color:#1A2E1A;font-size:28px;line-height:34px;font-weight:900;">
                  New issue submitted
                </h1>
                <p style="margin:12px 0 0;color:#243824;font-size:14px;line-height:22px;">
                  A customer has sent a new issue from the website. Please review the details below.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:30px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#D0E7D5;border:1px solid #b9d2bf;">
                  <tr>
                    <td style="padding:24px;">
                      <h2 style="margin:0 0 18px;color:#1A2E1A;font-size:20px;line-height:26px;font-weight:900;">
                        Issue details
                      </h2>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #b9d2bf;">
                        <tr>
                          <td style="padding:14px 16px;border-bottom:1px solid #e4eee6;color:#617064;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Name</td>
                          <td style="padding:14px 16px;border-bottom:1px solid #e4eee6;color:#1A2E1A;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(issue.name)}</td>
                        </tr>
                        <tr>
                          <td style="padding:14px 16px;border-bottom:1px solid #e4eee6;color:#617064;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Email</td>
                          <td style="padding:14px 16px;border-bottom:1px solid #e4eee6;color:#1A2E1A;font-size:14px;font-weight:700;text-align:right;">
                            <a href="mailto:${escapeHtml(issue.email)}" style="color:#1A2E1A;text-decoration:none;">${escapeHtml(issue.email)}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 16px;border-bottom:1px solid #e4eee6;color:#617064;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Phone</td>
                          <td style="padding:14px 16px;border-bottom:1px solid #e4eee6;color:#1A2E1A;font-size:14px;font-weight:700;text-align:right;">
                            <a href="tel:${escapeHtml(issue.phone)}" style="color:#1A2E1A;text-decoration:none;">${escapeHtml(issue.phone || 'N/A')}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 16px;color:#617064;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Submitted</td>
                          <td style="padding:14px 16px;color:#1A2E1A;font-size:14px;font-weight:700;text-align:right;">${submittedAt}</td>
                        </tr>
                      </table>

                      <div style="margin-top:20px;background:#ffffff;border:1px solid #b9d2bf;padding:18px;">
                        <div style="color:#617064;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">
                          Message
                        </div>
                        <div style="color:#263a26;font-size:15px;line-height:24px;white-space:pre-line;">
                          ${escapeHtml(issue.message || 'N/A')}
                        </div>
                      </div>

                      <div style="margin-top:22px;">
                        <a href="mailto:${escapeHtml(issue.email)}" style="display:inline-block;background:#1A2E1A;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:12px 20px;">
                          Reply to customer
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:#1A2E1A;padding:20px 30px;text-align:center;">
                <p style="margin:0;color:#EAEBEC;font-size:12px;line-height:18px;">
                  Automated issue notification from <strong style="color:#FBFF26;">YOLO HEAT</strong>.
                </p>
                <p style="margin:8px 0 0;color:#EAEBEC;font-size:12px;line-height:18px;">
                  &copy; ${new Date().getFullYear()} <strong style="color:#FBFF26;">YOLO HEAT</strong>. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
