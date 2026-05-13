export function invoiceHtmlTemplate(data: {
  invoiceNumber: string;
  status: string;
  customerInfo: { name: string; email: string; phone?: string; address?: string; postcode?: string };
  boilers:     { name: string; numberOfBoiler: number;      price: number }[];
  controllers: { name: string; numberOfControllers: number; price: number }[];
  extras:      { name: string; numberOfExtra: number;       price: number }[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalDiscount?: number;
  total: number;
  dueDate?: Date | string;
  deliveryDate?: Date | string;
  notes?: string;
  createdAt?: Date | string;
}): string {
  const fmt  = (n: number) => `£${n.toFixed(2)}`;
  const date = (d?: Date | string) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  // ─── Row builders ──────────────────────────────────────────────────────────

  const boilerRows = data.boilers.map(i => `
    <tr>
      <td style="padding:8px 12px;">${i.name}</td>
      <td style="padding:8px 12px;text-align:center;">${i.numberOfBoiler}</td>
      <td style="padding:8px 12px;text-align:right;">${fmt(i.price)}</td>
      <td style="padding:8px 12px;text-align:right;">${fmt(i.price * i.numberOfBoiler)}</td>
    </tr>`).join('');

  const controllerRows = data.controllers.map(i => `
    <tr>
      <td style="padding:8px 12px;">${i.name}</td>
      <td style="padding:8px 12px;text-align:center;">${i.numberOfControllers}</td>
      <td style="padding:8px 12px;text-align:right;">${fmt(i.price)}</td>
      <td style="padding:8px 12px;text-align:right;">${fmt(i.price * i.numberOfControllers)}</td>
    </tr>`).join('');

  const extraRows = data.extras.map(i => `
    <tr>
      <td style="padding:8px 12px;">${i.name}</td>
      <td style="padding:8px 12px;text-align:center;">${i.numberOfExtra}</td>
      <td style="padding:8px 12px;text-align:right;">${fmt(i.price)}</td>
      <td style="padding:8px 12px;text-align:right;">${fmt(i.price * i.numberOfExtra)}</td>
    </tr>`).join('');

  // ─── Section header helper ─────────────────────────────────────────────────

  const sectionHeader = (label: string) => `
    <tr>
      <td colspan="4"
          style="padding:6px 12px;background:#f0f0e8;font-size:11px;
                 font-weight:700;letter-spacing:.06em;color:#555;text-transform:uppercase;">
        ${label}
      </td>
    </tr>`;

  const hasBoilers     = data.boilers.length     > 0;
  const hasControllers = data.controllers.length > 0;
  const hasExtras      = data.extras.length      > 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #222; background: #fff; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body style="padding:32px;">

  <!-- Header -->
  <table style="margin-bottom:28px;">
    <tr>
      <td>
        <div style="font-size:24px;font-weight:900;letter-spacing:-1px;color:#1a2e1a;">
          ■ YOLO HEAT
        </div>
        <div style="font-size:11px;color:#666;margin-top:4px;">
          London, United Kingdom · hello@yoloheat.co.uk
        </div>
      </td>
      <td style="text-align:right;">
        <div style="font-size:20px;font-weight:700;color:#1a2e1a;">INVOICE</div>
        <div style="font-size:13px;color:#444;margin-top:4px;">${data.invoiceNumber}</div>
        <div style="margin-top:8px;">
          <span style="background:${data.status === 'paid' ? '#22c55e' : data.status === 'cancelled' ? '#ef4444' : '#f59e0b'};
                       color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;
                       text-transform:uppercase;">
            ${data.status}
          </span>
        </div>
      </td>
    </tr>
  </table>

  <!-- Meta -->
  <table style="margin-bottom:24px;font-size:12px;color:#555;">
    <tr>
      <td style="width:50%;vertical-align:top;">
        <strong style="color:#1a2e1a;">Bill To</strong><br/>
        <span style="font-size:14px;font-weight:600;color:#222;">${data.customerInfo.name}</span><br/>
        ${data.customerInfo.email}<br/>
        ${data.customerInfo.phone  ? data.customerInfo.phone  + '<br/>' : ''}
        ${data.customerInfo.address ? data.customerInfo.address + '<br/>' : ''}
        ${data.customerInfo.postcode ?? ''}
      </td>
      <td style="width:50%;text-align:right;vertical-align:top;">
        <table style="margin-left:auto;font-size:12px;">
          <tr><td style="padding:2px 8px;color:#888;">Issue Date</td>
              <td style="padding:2px 0;font-weight:600;">${date(data.createdAt)}</td></tr>
          <tr><td style="padding:2px 8px;color:#888;">Due Date</td>
              <td style="padding:2px 0;font-weight:600;">${date(data.dueDate)}</td></tr>
          ${data.deliveryDate ? `<tr><td style="padding:2px 8px;color:#888;">Delivery</td>
              <td style="padding:2px 0;font-weight:600;">${date(data.deliveryDate)}</td></tr>` : ''}
        </table>
      </td>
    </tr>
  </table>

  <!-- Line items -->
  <table style="margin-bottom:20px;border:1px solid #e8e8e0;border-radius:6px;overflow:hidden;">
    <thead>
      <tr style="background:#1a2e1a;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">
        <th style="padding:10px 12px;text-align:left;">Description</th>
        <th style="padding:10px 12px;text-align:center;">Qty</th>
        <th style="padding:10px 12px;text-align:right;">Unit Price</th>
        <th style="padding:10px 12px;text-align:right;">Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${hasBoilers     ? sectionHeader('Boilers')     + boilerRows     : ''}
      ${hasControllers ? sectionHeader('Controllers') + controllerRows : ''}
      ${hasExtras      ? sectionHeader('Extras')      + extraRows      : ''}
    </tbody>
  </table>

  <!-- Totals -->
  <table style="margin-left:auto;width:260px;font-size:13px;margin-bottom:24px;">
    <tr>
      <td style="padding:4px 0;color:#666;">Subtotal</td>
      <td style="padding:4px 0;text-align:right;">${fmt(data.subtotal)}</td>
    </tr>
    ${(data.totalDiscount ?? 0) > 0 ? `
    <tr>
      <td style="padding:4px 0;color:#666;">Discount</td>
      <td style="padding:4px 0;text-align:right;color:#22c55e;">-${fmt(data.totalDiscount!)}</td>
    </tr>` : ''}
    <tr>
      <td style="padding:4px 0;color:#666;">VAT (${data.vatRate}%)</td>
      <td style="padding:4px 0;text-align:right;">${fmt(data.vatAmount)}</td>
    </tr>
    <tr style="border-top:2px solid #1a2e1a;font-weight:700;font-size:15px;">
      <td style="padding:8px 0 0;">Total</td>
      <td style="padding:8px 0 0;text-align:right;">${fmt(data.total)}</td>
    </tr>
  </table>

  <!-- Notes -->
  ${data.notes ? `
  <div style="border-top:1px solid #e8e8e0;padding-top:14px;font-size:12px;color:#666;">
    <strong style="color:#333;">Notes:</strong><br/>${data.notes}
  </div>` : ''}

</body>
</html>`;
}