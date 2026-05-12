// ─── Build HTML email template ────────────────────────────────────────────
export const buildEmailHtml = (
  name: string,
  message: string,
  attachmentUrl?: string,
): string => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>YOLO HEAT</title>
        <style>
          body { margin: 0; padding: 0; background: #f3f5f8; font-family: Arial, sans-serif; }
          .wrapper { max-width: 620px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #dde5ee; box-shadow: 0 8px 24px rgba(17, 46, 82, 0.08); }
          .brand { background: #e8ff00; padding: 18px 28px; color: #102f52; font-size: 14px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; }
          .header { background: #dfe7ef; padding: 28px 32px; border-bottom: 4px solid #e8ff00; }
          .header h1 { color: #102f52; margin: 0; font-size: 28px; line-height: 1.2; font-weight: 800; }
          .header p { color: #354a60; margin: 10px 0 0; font-size: 15px; line-height: 1.6; }
          .body { padding: 28px 32px 32px; color: #102f52; }
          .message-card { background: #f7f9fb; border: 1px solid #dde5ee; border-radius: 10px; padding: 22px; }
          .greeting { color: #102f52; font-size: 18px; font-weight: 800; margin-bottom: 14px; }
          .message { color: #354a60; font-size: 15px; line-height: 1.7; white-space: pre-line; }
          .attachment { margin-top: 24px; text-align: center; }
          .attachment img { max-width: 100%; border-radius: 10px; border: 1px solid #dde5ee; }
          .footer { background: #102f52; padding: 18px 32px; text-align: center; font-size: 12px; color: #dfe7ef; }
          .footer strong { color: #e8ff00; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="brand">YOLO HEAT</div>
          <div class="header">
            <h1>YOLO HEAT</h1>
            <p>Heating and installation specialists</p>
          </div>
          <div class="body">
            <div class="message-card">
              <div class="greeting">Hello, ${name}!</div>
              <div class="message">${message}</div>
              ${
                attachmentUrl
                  ? `<div class="attachment">
                      <img src="${attachmentUrl}" alt="Attachment" />
                    </div>`
                  : ''
              }
            </div>
          </div>
          <div class="footer">
            <p>You are receiving this because you requested a quote from YOLO HEAT.</p>
            <p>&copy; ${new Date().getFullYear()} <strong>YOLO HEAT</strong>. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
};

// mailer/templates.js
// Drop-in Nodemailer HTML templates for YOLO HEAT
// Usage: import { teamEmail, customerEmail } from './mailer/templates.js'

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BASE = `
  body{margin:0;padding:0;background:#f0f0f0;font-family:'Segoe UI',Arial,sans-serif}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #ddd}
  .header{background:#E8FF00;padding:20px 24px;display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:15px;font-weight:800;letter-spacing:.1em;color:#1A2B3C}
  .badge{background:#1A2B3C;color:#E8FF00;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px}
  .accent{height:4px;background:#1E7A5C}
  .body{padding:28px 24px 20px}
  h2{font-size:18px;font-weight:700;color:#1A2B3C;margin:0 0 10px}
  p{font-size:14px;color:#555;line-height:1.6;margin:0 0 16px}
  .summary{border-left:3px solid #1E7A5C;border-radius:0 8px 8px 0;background:#f7f7f7;padding:14px 16px;margin:0 0 20px}
  .row{display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #eee}
  .row:last-child{border-bottom:none}
  .rl{color:#888}.rv{color:#1A2B3C;font-weight:600}
  .urgent{background:#fff8e1;border:1.5px solid #E8FF00;border-radius:8px;padding:10px 14px;font-size:13px;color:#1A2B3C;font-weight:600;margin-bottom:18px}
  .hours{background:#E8FF00;border-radius:8px;padding:10px 14px;font-size:12px;color:#1A2B3C;font-weight:700;margin:0 0 16px}
  .cta{text-align:center;margin:20px 0 6px}
  .btn-yellow{display:inline-block;background:#E8FF00;color:#1A2B3C;text-decoration:none;padding:12px 30px;border-radius:8px;font-weight:800;font-size:14px}
  .btn-green{display:inline-block;background:#1E7A5C;color:#fff;text-decoration:none;padding:12px 30px;border-radius:8px;font-weight:700;font-size:14px}
  .btn-outline{display:inline-block;background:transparent;color:#1E7A5C;text-decoration:none;padding:11px 30px;border-radius:8px;font-weight:700;font-size:14px;border:1.5px solid #1E7A5C}
  .divider{height:1px;background:#f0f0f0;margin:16px 0}
  .footer{background:#1A2B3C;padding:14px 24px;text-align:center}
  .footer p{font-size:11px;color:#8899aa;margin:0}
  .footer span{color:#E8FF00;font-weight:700}
`;

// ─── Team notification email ─────────────────────────────────
function teamEmail({
  name,
  phone,
  reason,
  notes,
  mode,
  companyEmail,
  teamEmail: to,
}) {
  const modeLabel =
    mode === 'callback' ? 'Callback request' : 'Live chat request';
  const icon = mode === 'callback' ? '📞' : '💬';
  const submitted = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
  });

  return {
    from: `"YOLO HEAT Website" <${companyEmail}>`,
    to,
    subject: `[${modeLabel}] ${name} – ${reason}`,
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>${BASE}</style></head><body>
<div class="wrap">
  <div class="header">
    <span class="logo">YOLO HEAT</span>
    <span class="badge">${icon} ${modeLabel}</span>
  </div>
  <div class="accent"></div>
  <div class="body">
    <div class="urgent">⚡ New customer request — respond as soon as possible</div>
    <h2>New ${modeLabel.toLowerCase()}</h2>
    <p>A customer has submitted a ${modeLabel.toLowerCase()} via the website. Please contact them within 1 hour.</p>
    <div class="summary">
      <div class="row"><span class="rl">Name</span><span class="rv">${escHtml(name)}</span></div>
      <div class="row"><span class="rl">Phone</span><span class="rv"><a href="tel:${escHtml(phone)}" style="color:#1E7A5C">${escHtml(phone)}</a></span></div>
      <div class="row"><span class="rl">Reason</span><span class="rv">${escHtml(reason)}</span></div>
      ${notes ? `<div class="row"><span class="rl">Notes</span><span class="rv" style="color:#555;font-weight:400">${escHtml(notes)}</span></div>` : ''}
      <div class="row"><span class="rl">Submitted</span><span class="rv" style="color:#888;font-weight:400">${submitted}</span></div>
    </div>
    <div class="cta">
      <a href="tel:${escHtml(phone)}" class="btn-yellow">📞&nbsp; Call ${escHtml(name)} now</a>
    </div>
  </div>
  <div class="footer"><p>Automated notification &nbsp;·&nbsp; <span>YOLO HEAT</span> &nbsp;·&nbsp; Do not reply</p></div>
</div>
</body></html>`,
  };
}

// ─── Customer confirmation email ─────────────────────────────
function customerEmail({
  name,
  phone,
  reason,
  mode,
  email,
  companyEmail,
  companyPhone,
  website,
}) {
  const modeLabel =
    mode === 'callback' ? 'callback request' : 'live chat request';

  return {
    from: `"YOLO HEAT" <${companyEmail}>`,
    to: email,
    subject: `We've received your request – YOLO HEAT`,
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<style>${BASE}</style></head><body>
<div class="wrap">
  <div class="header">
    <span class="logo">YOLO HEAT</span>
    <span class="badge">Request received</span>
  </div>
  <div class="accent"></div>
  <div class="body">
    <h2>Hi ${escHtml(name)}, we're on it!</h2>
    <p>Thanks for getting in touch. We've received your ${modeLabel} and our team will contact you <strong>as soon as possible</strong> — usually within 1 hour during office hours.</p>
    <div class="summary">
      <div class="row"><span class="rl">Name</span><span class="rv">${escHtml(name)}</span></div>
      <div class="row"><span class="rl">Phone</span><span class="rv">${escHtml(phone)}</span></div>
      <div class="row"><span class="rl">Reason</span><span class="rv">${escHtml(reason)}</span></div>
    </div>
    <div class="hours">🕐&nbsp; Office hours: Mon–Fri 8am–8pm &nbsp;|&nbsp; Sat &amp; Sun 9am–3pm</div>
    <p style="font-size:13px;color:#888">Need urgent help outside office hours? Call us on <a href="tel:${escHtml(companyPhone)}" style="color:#1E7A5C;font-weight:600">${escHtml(companyPhone)}</a>.</p>
    <div class="divider"></div>
    <div class="cta">
      <a href="${escHtml(website)}" class="btn-outline">Visit ${escHtml(website)}</a>
    </div>
  </div>
  <div class="footer"><p><span>YOLO HEAT</span> &nbsp;·&nbsp; Heating &amp; Installation Specialists</p></div>
</div>
</body></html>`,
  };
}

export const buildFollowUpEmail = (
  name: string,
  price: string,
  code: string
): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>YOLO HEAT</title>
    <style>
      body { margin: 0; padding: 0; background: #f3f5f8; font-family: Arial, sans-serif; }
      .wrapper { max-width: 620px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #dde5ee; box-shadow: 0 8px 24px rgba(17, 46, 82, 0.08); }
      
      .brand { background: #e8ff00; padding: 18px 28px; color: #102f52; font-size: 14px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; }
      
      .header { background: #dfe7ef; padding: 28px 32px; border-bottom: 4px solid #e8ff00; }
      .header h1 { color: #102f52; margin: 0; font-size: 28px; font-weight: 800; }
      .header p { color: #354a60; margin: 10px 0 0; font-size: 15px; }

      .body { padding: 28px 32px 32px; color: #102f52; }
      
      .message-card { background: #f7f9fb; border: 1px solid #dde5ee; border-radius: 10px; padding: 22px; }

      .greeting { font-size: 18px; font-weight: 800; margin-bottom: 16px; }

      .message { font-size: 15px; line-height: 1.7; color: #354a60; }

      .highlight {
        display: inline-block;
        background: #e8ff00;
        color: #102f52;
        font-weight: 800;
        padding: 6px 10px;
        border-radius: 6px;
        margin: 6px 0;
      }

      .cta {
        display: inline-block;
        margin-top: 20px;
        background: #102f52;
        color: #ffffff !important;
        padding: 12px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 700;
      }

      .cta:hover {
        background: #0c2440;
      }

      .footer { background: #102f52; padding: 18px 32px; text-align: center; font-size: 12px; color: #dfe7ef; }
      .footer strong { color: #e8ff00; }
    </style>
  </head>

  <body>
    <div class="wrapper">
      
      <div class="brand">YOLO HEAT</div>

      <div class="header">
        <h1>No Worries. We've Got You.</h1>
        <p>Your quote is about to expire — don’t miss this.</p>
      </div>

      <div class="body">
        <div class="message-card">
          
          <div class="greeting">Hey ${name},</div>

          <div class="message">
            🥁... your quotes expire <strong>tonight</strong>.<br/><br/>

            So, as a last attempt to secure your booking (and yes… help us hit our targets 🙄), 
            we’ve unlocked something special for you.<br/><br/>

            How does a <strong>FREE Hive Mini Smart Thermostat</strong> (worth up to 
            <span class="highlight">£${price}</span>) sound?<br/><br/>

            To lock in your price and claim your FREE gift, use code:<br/>
            <span class="highlight">${code}</span><br/><br/>

            We’ll add it to your installation — completely free.<br/>
          </div>

          <a href="#" class="cta">Complete your booking 👈</a>

        </div>
      </div>

      <div class="footer">
        <p>You are receiving this because you requested a quote from YOLO HEAT.</p>
        <p>&copy; ${new Date().getFullYear()} <strong>YOLO HEAT</strong>. All rights reserved.</p>
      </div>

    </div>
  </body>
  </html>
  `;
};

export { teamEmail, customerEmail };
