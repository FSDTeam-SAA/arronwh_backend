 // ─── Build HTML email template ────────────────────────────────────────────
 export const buildEmailHtml = (
    name: string,
    message: string,
    attachmentUrl?: string,
  ): string =>{
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>YOLO HEAT</title>
        <style>
          body { margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
          .header { background: #1a1a2e; padding: 28px 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
          .body { padding: 32px; color: #333333; }
          .greeting { font-size: 18px; font-weight: bold; margin-bottom: 16px; }
          .message { font-size: 15px; line-height: 1.7; color: #555555; white-space: pre-line; }
          .attachment { margin-top: 24px; text-align: center; }
          .attachment img { max-width: 100%; border-radius: 6px; border: 1px solid #e0e0e0; }
          .footer { background: #f0f0f0; padding: 18px 32px; text-align: center; font-size: 12px; color: #999999; }
          .unsubscribe { color: #999999; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>YOLO HEAT</h1>
          </div>
          <div class="body">
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
          <div class="footer">
            <p>You are receiving this because you requested a quote from YOLO HEAT.</p>
            <p>&copy; ${new Date().getFullYear()} YOLO HEAT. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }