// interface LineItem {
//   label: string;
//   price: number;
//   discount?: number;
//   description?: string;
//   qty?: number;
// }

// interface CustomerInfo {
//   name: string;
//   email: string;
//   phone?: string;
//   address?: string;
//   postcode?: string;
// }

// export interface InvoiceTemplateData {
//   invoiceNumber: string;
//   status: string;
//   customerInfo: CustomerInfo;
//   boilers: LineItem[];
//   controllers: LineItem[];
//   extras: LineItem[];
//   subtotal: number;
//   vatRate: number;
//   vatAmount: number;
//   totalDiscount: number;
//   total: number;
//   dueDate?: Date | string;
//   deliveryDate?: Date | string;
//   notes?: string;
//   createdAt?: Date | string;
// }

// // ─── Brand tokens ─────────────────────────────────────────────────────────────
// const YELLOW = '#FBFF26';
// const GREEN  = '#D0E7D5';
// const DARK   = '#111111';
// const BORDER = '#b5ceba';
// const Y_BORDER = '#d4d800';

// // ─── Inline SVG logo (matches the real Yolo Heat logotype exactly) ────────────
// const LOGO_SVG = `
// <svg width="180" height="40" viewBox="0 0 540 90" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <rect x="2" y="2" width="76" height="76" rx="5" stroke="${DARK}" stroke-width="5" fill="none"/>
//   <rect x="17" y="17" width="24" height="24" rx="3" stroke="${DARK}" stroke-width="4.5" fill="none"/>
//   <text x="98" y="64"
//         font-family="Arial,Helvetica,sans-serif"
//         font-size="64"
//         font-weight="700"
//         letter-spacing="5"
//         fill="${DARK}">YOLO HEAT</text>
// </svg>`.trim();

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const fmt = (n: number) =>
//   `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// const fmtDate = (d?: Date | string) => {
//   if (!d) return '—';
//   const date = d instanceof Date ? d : new Date(d);
//   return date.toLocaleDateString('en-GB');
// };

// const statusBadge = (status: string) => {
//   const styles: Record<string, string> = {
//     paid:      'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7',
//     pending:   'background:#fef3c7;color:#92400e;border:1px solid #fcd34d',
//     cancelled: 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5',
//     refunded:  'background:#ede9fe;color:#5b21b6;border:1px solid #c4b5fd',
//   };
//   const s = styles[status] ?? 'background:#f3f4f6;color:#374151;border:1px solid #d1d5db';
//   return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;${s}">${status}</span>`;
// };

// const buildRows = (items: LineItem[]): string =>
//   items.map((item, i) => {
//     const qty       = item.qty ?? 1;
//     const discount  = item.discount ?? 0;
//     const lineTotal = item.price * qty - discount;
//     const bg = i % 2 === 0 ? GREEN : '#c2dfc9';
//     return `<tr style="border-bottom:0.5px solid ${BORDER};background:${bg}">
//       <td style="padding:8px 10px;text-align:center;color:#555;">${qty}</td>
//       <td style="padding:8px 10px;text-align:left;color:#333;">${item.label}</td>
//       <td style="padding:8px 10px;text-align:right;color:#333;">${fmt(item.price)}</td>
//       <td style="padding:8px 10px;text-align:right;color:#333;">${discount ? fmt(discount) : '—'}</td>
//       <td style="padding:8px 10px;text-align:right;color:#333;font-weight:700;">${fmt(lineTotal)}</td>
//     </tr>`;
//   }).join('');

// // ─── Main template ────────────────────────────────────────────────────────────

// export function invoiceHtmlTemplate(data: InvoiceTemplateData): string {
//   const allRows = [
//     buildRows(data.boilers ?? []),
//     buildRows(data.controllers ?? []),
//     buildRows(data.extras ?? []),
//   ].join('') || `<tr><td colspan="5" style="padding:20px;text-align:center;color:#aaa">No items</td></tr>`;

//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8"/>
// <title>Invoice ${data.invoiceNumber}</title>
// <style>
//   *{box-sizing:border-box;margin:0;padding:0}
//   body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;background:#e8f0ea}
//   .page{max-width:720px;margin:0 auto;background:${GREEN};box-shadow:0 2px 16px rgba(0,0,0,0.10)}
//   @media print{body{background:#fff}.page{box-shadow:none;max-width:100%}}
// </style>
// </head>
// <body>
// <div class="page">

//   <!-- ── HEADER: yellow background, logo left, contact below ── -->
//   <div style="background:${YELLOW};padding:22px 28px 16px">
//     ${LOGO_SVG}
//     <div style="font-size:11px;color:#333;line-height:1.85;margin-top:8px">
//       London, United Kingdom &nbsp;&middot;&nbsp; P: 0800 123 4567 &nbsp;&middot;&nbsp; E: hello@yoloheat.co.uk
//     </div>
//   </div>

//   <!-- ── BILL TO / SHIP TO / INVOICE ── -->
//   <div style="display:flex;padding:16px 28px 14px;border-bottom:1px solid ${BORDER}">

//     <div style="flex:1;padding-right:20px">
//       <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:5px">Bill To:</div>
//       <div style="font-size:11px;color:#333;line-height:1.85">
//         ${data.customerInfo.name}<br>
//         ${data.customerInfo.address ? data.customerInfo.address + '<br>' : ''}
//         ${data.customerInfo.postcode ? data.customerInfo.postcode + '<br>' : ''}
//         ${data.customerInfo.phone ?? ''}
//       </div>
//     </div>

//     <div style="flex:1;padding-right:20px">
//       <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:5px">Ship To:</div>
//       <div style="font-size:11px;color:#333;line-height:1.85">
//         ${data.customerInfo.name}<br>
//         ${data.customerInfo.address ? data.customerInfo.address + '<br>' : ''}
//         ${data.customerInfo.postcode ? data.customerInfo.postcode + '<br>' : ''}
//         ${data.customerInfo.phone ?? ''}
//       </div>
//     </div>

//     <div style="text-align:right;min-width:170px">
//       <div style="font-size:30px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${DARK};line-height:1">INVOICE</div>
//       <div style="font-size:11px;color:#444;margin-top:5px"># ${data.invoiceNumber}</div>
//       <div style="font-size:11px;color:#444">${fmtDate(data.createdAt)}</div>
//       <div style="margin-top:6px">${statusBadge(data.status)}</div>
//     </div>
//   </div>

//   <!-- ── META BAR ── -->
//   <div style="background:${YELLOW};display:flex;padding:7px 28px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;border-top:1px solid ${Y_BORDER};border-bottom:1px solid ${Y_BORDER}">
//     <div style="flex:1">Salesperson</div>
//     <div style="flex:1">Shipping Terms</div>
//     <div style="flex:1">Delivery Date</div>
//     <div style="flex:1;text-align:right">Due Date</div>
//   </div>
//   <div style="display:flex;padding:7px 28px 10px;font-size:11px;color:#444;border-bottom:1px solid ${BORDER}">
//     <div style="flex:1">Yolo Heat Team</div>
//     <div style="flex:1">Standard Install</div>
//     <div style="flex:1">${fmtDate(data.deliveryDate)}</div>
//     <div style="flex:1;text-align:right">${fmtDate(data.dueDate)}</div>
//   </div>

//   <!-- ── LINE ITEMS TABLE ── -->
//   <table style="width:100%;border-collapse:collapse;font-size:11px">
//     <thead>
//       <tr style="background:${YELLOW};border-top:1px solid ${Y_BORDER};border-bottom:1px solid ${Y_BORDER}">
//         <th style="padding:8px 10px;text-align:center;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:44px">QTY</th>
//         <th style="padding:8px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333">Description</th>
//         <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:100px">Unit Price</th>
//         <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:90px">Discount</th>
//         <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:90px">Total</th>
//       </tr>
//     </thead>
//     <tbody>${allRows}</tbody>
//   </table>

//   <!-- ── DIVIDER + TOTALS ── -->
//   <div style="border-top:1.5px solid #9aab9a;margin:6px 28px 0"></div>

//   <div style="display:flex;justify-content:flex-end;padding:8px 28px 4px">
//     <table style="width:215px;border-collapse:collapse;font-size:11px">
//       <tr>
//         <td style="padding:3px 6px;color:#555">Total Discount</td>
//         <td style="padding:3px 6px;text-align:right;font-weight:700;color:#222">${fmt(data.totalDiscount ?? 0)}</td>
//       </tr>
//       <tr>
//         <td style="padding:3px 6px;color:#555">Subtotal</td>
//         <td style="padding:3px 6px;text-align:right;font-weight:700;color:#222">${fmt(data.subtotal)}</td>
//       </tr>
//       <tr>
//         <td style="padding:3px 6px;color:#555">VAT (${data.vatRate}%)</td>
//         <td style="padding:3px 6px;text-align:right;font-weight:700;color:#222">${fmt(data.vatAmount)}</td>
//       </tr>
//       <tr style="border-top:1.5px solid #888">
//         <td style="padding:8px 6px 4px;font-size:15px;font-weight:700;color:${DARK}">TOTAL</td>
//         <td style="padding:8px 6px 4px;text-align:right;font-size:15px;font-weight:700;color:${DARK}">${fmt(data.total)}</td>
//       </tr>
//     </table>
//   </div>

//   <!-- ── PAYMENT NOTE ── -->
//   <div style="border-top:0.5px solid ${BORDER};margin-top:10px;padding:8px 28px 4px;font-size:10px;color:#555">
//     Make all checks payable to: <strong>Yolo Heat Ltd</strong> &nbsp;&middot;&nbsp; PayPal: hello@yoloheat.co.uk
//   </div>
//   <div style="padding:2px 28px 10px;font-size:10px;color:#555;font-style:italic">
//     ${data.notes ?? 'Thank you for choosing Yolo Heat.'}
//   </div>

//   <!-- ── YELLOW FOOTER BAR ── -->
//   <div style="height:8px;background:${YELLOW}"></div>

//   <!-- ── SOCIAL FOOTER ── -->
//   <div style="display:flex;justify-content:flex-end;padding:10px 28px 12px">
//     <div style="display:flex;flex-direction:column;gap:3px">
//       <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:10px;color:#444">
//         facebook.com/yoloheat
//         <span style="width:14px;height:14px;background:#3b5998;border-radius:50%;display:inline-block;flex-shrink:0"></span>
//       </div>
//       <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:10px;color:#444">
//         linkedin.com/company/yoloheat
//         <span style="width:14px;height:14px;background:#0077b5;border-radius:50%;display:inline-block;flex-shrink:0"></span>
//       </div>
//       <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:10px;color:#444">
//         twitter.com/yoloheat
//         <span style="width:14px;height:14px;background:#1da1f2;border-radius:50%;display:inline-block;flex-shrink:0"></span>
//       </div>
//     </div>
//   </div>

// </div>
// </body>
// </html>`;
// }


interface LineItem {
  label: string;
  price: number;
  discount?: number;
  description?: string;
  qty?: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  postcode?: string;
}

export interface InvoiceTemplateData {
  invoiceNumber: string;
  status: string;
  customerInfo: CustomerInfo;
  boilers: LineItem[];
  controllers: LineItem[];
  extras: LineItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalDiscount: number;
  total: number;
  dueDate?: Date | string;
  deliveryDate?: Date | string;
  notes?: string;
  createdAt?: Date | string;
}

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const YELLOW = '#FBFF26';
const GREEN  = '#D0E7D5';
const DARK   = '#111111';
const BORDER = '#b5ceba';
const Y_BORDER = '#d4d800';

// ─── Inline SVG logo (matches the real Yolo Heat logotype exactly) ────────────
const LOGO_SVG = `
<svg width="180" height="40" viewBox="0 0 540 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="76" height="76" rx="5" stroke="${DARK}" stroke-width="5" fill="none"/>
  <rect x="17" y="17" width="24" height="24" rx="3" stroke="${DARK}" stroke-width="4.5" fill="none"/>
  <text x="98" y="64"
        font-family="Arial,Helvetica,sans-serif"
        font-size="64"
        font-weight="700"
        letter-spacing="5"
        fill="${DARK}">YOLO HEAT</text>
</svg>`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d?: Date | string) => {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-GB');
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    paid:      'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7',
    pending:   'background:#fef3c7;color:#92400e;border:1px solid #fcd34d',
    cancelled: 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5',
    refunded:  'background:#ede9fe;color:#5b21b6;border:1px solid #c4b5fd',
  };
  const s = styles[status] ?? 'background:#f3f4f6;color:#374151;border:1px solid #d1d5db';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;${s}">${status}</span>`;
};

const buildRows = (items: LineItem[]): string =>
  items.map((item, i) => {
    const qty       = item.qty ?? 1;
    const discount  = item.discount ?? 0;
    const lineTotal = item.price * qty - discount;
    const bg = i % 2 === 0 ? GREEN : '#c2dfc9';
    return `<tr style="border-bottom:0.5px solid ${BORDER};background:${bg}">
      <td style="padding:8px 10px;text-align:center;color:#555;">${qty}</td>
      <td style="padding:8px 10px;text-align:left;color:#333;">${item.label}</td>
      <td style="padding:8px 10px;text-align:right;color:#333;">${fmt(item.price)}</td>
      <td style="padding:8px 10px;text-align:right;color:#333;">${discount ? fmt(discount) : '—'}</td>
      <td style="padding:8px 10px;text-align:right;color:#333;font-weight:700;">${fmt(lineTotal)}</td>
    </tr>`;
  }).join('');

// ─── Main template ────────────────────────────────────────────────────────────

export function invoiceHtmlTemplate(data: InvoiceTemplateData): string {
  const allRows = [
    buildRows(data.boilers ?? []),
    buildRows(data.controllers ?? []),
    buildRows(data.extras ?? []),
  ].join('') || `<tr><td colspan="5" style="padding:20px;text-align:center;color:#aaa">No items</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${data.invoiceNumber}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;background:#e8f0ea}
  .page{max-width:720px;margin:0 auto;background:${GREEN};box-shadow:0 2px 16px rgba(0,0,0,0.10)}
  @media print{body{background:#fff}.page{box-shadow:none;max-width:100%}}
</style>
</head>
<body>
<div class="page">

  <!-- ── HEADER: yellow background, logo left, contact below ── -->
  <div style="background:${YELLOW};padding:22px 28px 16px">
    ${LOGO_SVG}
    <div style="font-size:11px;color:#333;line-height:1.85;margin-top:8px">
      London, United Kingdom &nbsp;&middot;&nbsp; P: 0800 123 4567 &nbsp;&middot;&nbsp; E: hello@yoloheat.co.uk
    </div>
  </div>

  <!-- ── BILL TO / SHIP TO / INVOICE ── -->
  <div style="display:flex;padding:16px 28px 14px;border-bottom:1px solid ${BORDER}">

    <div style="flex:1;padding-right:20px">
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:5px">Bill To:</div>
      <div style="font-size:11px;color:#333;line-height:1.85">
        ${data.customerInfo.name}<br>
        ${data.customerInfo.address ? data.customerInfo.address + '<br>' : ''}
        ${data.customerInfo.postcode ? data.customerInfo.postcode + '<br>' : ''}
        ${data.customerInfo.phone ?? ''}
      </div>
    </div>

    <div style="flex:1;padding-right:20px">
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:5px">Ship To:</div>
      <div style="font-size:11px;color:#333;line-height:1.85">
        ${data.customerInfo.name}<br>
        ${data.customerInfo.address ? data.customerInfo.address + '<br>' : ''}
        ${data.customerInfo.postcode ? data.customerInfo.postcode + '<br>' : ''}
        ${data.customerInfo.phone ?? ''}
      </div>
    </div>

    <div style="text-align:right;min-width:170px">
      <div style="font-size:30px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${DARK};line-height:1">INVOICE</div>
      <div style="font-size:11px;color:#444;margin-top:5px"># ${data.invoiceNumber}</div>
      <div style="font-size:11px;color:#444">${fmtDate(data.createdAt)}</div>
      <div style="margin-top:6px">${statusBadge(data.status)}</div>
    </div>
  </div>

  <!-- ── META BAR ── -->
  <div style="background:${YELLOW};display:flex;padding:7px 28px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;border-top:1px solid ${Y_BORDER};border-bottom:1px solid ${Y_BORDER}">
    <div style="flex:1">Salesperson</div>
    <div style="flex:1">Shipping Terms</div>
    <div style="flex:1">Delivery Date</div>
    <div style="flex:1;text-align:right">Due Date</div>
  </div>
  <div style="display:flex;padding:7px 28px 10px;font-size:11px;color:#444;border-bottom:1px solid ${BORDER}">
    <div style="flex:1">Yolo Heat Team</div>
    <div style="flex:1">Standard Install</div>
    <div style="flex:1">${fmtDate(data.deliveryDate)}</div>
    <div style="flex:1;text-align:right">${fmtDate(data.dueDate)}</div>
  </div>

  <!-- ── LINE ITEMS TABLE ── -->
  <table style="width:100%;border-collapse:collapse;font-size:11px">
    <thead>
      <tr style="background:${YELLOW};border-top:1px solid ${Y_BORDER};border-bottom:1px solid ${Y_BORDER}">
        <th style="padding:8px 10px;text-align:center;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:44px">QTY</th>
        <th style="padding:8px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333">Description</th>
        <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:100px">Unit Price</th>
        <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:90px">Discount</th>
        <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#333;width:90px">Total</th>
      </tr>
    </thead>
    <tbody>${allRows}</tbody>
  </table>

  <!-- ── DIVIDER + TOTALS ── -->
  <div style="border-top:1.5px solid #9aab9a;margin:6px 28px 0"></div>

  <div style="display:flex;justify-content:flex-end;padding:8px 28px 4px">
    <table style="width:215px;border-collapse:collapse;font-size:11px">
      <tr>
        <td style="padding:3px 6px;color:#555">Total Discount</td>
        <td style="padding:3px 6px;text-align:right;font-weight:700;color:#222">${fmt(data.totalDiscount ?? 0)}</td>
      </tr>
      <tr>
        <td style="padding:3px 6px;color:#555">Subtotal</td>
        <td style="padding:3px 6px;text-align:right;font-weight:700;color:#222">${fmt(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:3px 6px;color:#555">VAT (${data.vatRate}%)</td>
        <td style="padding:3px 6px;text-align:right;font-weight:700;color:#222">${fmt(data.vatAmount)}</td>
      </tr>
      <tr style="border-top:1.5px solid #888">
        <td style="padding:8px 6px 4px;font-size:15px;font-weight:700;color:${DARK}">TOTAL</td>
        <td style="padding:8px 6px 4px;text-align:right;font-size:15px;font-weight:700;color:${DARK}">${fmt(data.total)}</td>
      </tr>
    </table>
  </div>

  <!-- ── PAYMENT NOTE ── -->
  <div style="border-top:0.5px solid ${BORDER};margin-top:10px;padding:8px 28px 4px;font-size:10px;color:#555">
    Make all checks payable to: <strong>Yolo Heat Ltd</strong> &nbsp;&middot;&nbsp; PayPal: hello@yoloheat.co.uk
  </div>
  <div style="padding:2px 28px 10px;font-size:10px;color:#555;font-style:italic">
    ${data.notes ?? 'Thank you for choosing Yolo Heat.'}
  </div>

  <!-- ── YELLOW FOOTER BAR ── -->
  <div style="height:8px;background:${YELLOW}"></div>

  <!-- ── SOCIAL FOOTER ── -->
  <div style="display:flex;justify-content:flex-end;padding:10px 28px 12px">
    <div style="display:flex;flex-direction:column;gap:3px">
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:10px;color:#444">
        facebook.com/yoloheat
        <span style="width:14px;height:14px;background:#3b5998;border-radius:50%;display:inline-block;flex-shrink:0"></span>
      </div>
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:10px;color:#444">
        linkedin.com/company/yoloheat
        <span style="width:14px;height:14px;background:#0077b5;border-radius:50%;display:inline-block;flex-shrink:0"></span>
      </div>
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:10px;color:#444">
        twitter.com/yoloheat
        <span style="width:14px;height:14px;background:#1da1f2;border-radius:50%;display:inline-block;flex-shrink:0"></span>
      </div>
    </div>
  </div>

</div>
</body>
</html>`;
}