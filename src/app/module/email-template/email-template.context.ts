export type EmailRenderContext = Record<string, unknown>;

const escapeHtml = (value?: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeHtmlAttribute = (value?: unknown) =>
  escapeHtml(value).replace(/`/g, '&#96;');

const normalizeExternalUrl = (value?: string): string => {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;

  return trimmed;
};

export const moneyText = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `£${value.toLocaleString('en-GB')}`
    : 'N/A';

export const moneyTextWithPence = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `£${value.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '£0.00';

export const formatDateText = (date?: Date | string) =>
  date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';

export const formatLondonDateTime = (date = new Date()) =>
  date.toLocaleString('en-GB', { timeZone: 'Europe/London' });

export const parsePriceValue = (price?: number | string) => {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : undefined;
  }

  if (typeof price === 'string') {
    const cleaned = price.trim().replace(/[^0-9.-]/g, '');
    if (!cleaned) return undefined;

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

export const getQuoteTotal = (quote: any, price?: number | string) => {
  const parsedPrice = parsePriceValue(price);
  if (typeof parsedPrice === 'number') return parsedPrice;

  const product = quote.productId ?? {};
  const controller = quote.controller ?? {};
  const extra = quote.extra ?? {};

  const subtotal =
    (product.payablePrice ?? product.price ?? 0) +
    (controller.price ?? 0) +
    (extra.price ?? 0);

  const coupon = quote.coupon ?? null;
  const discount =
    coupon?.type === 'percentage'
      ? Math.round((subtotal * coupon.value) / 100)
      : (coupon?.value ?? 0);

  return Math.max(subtotal - discount, 0);
};

export const getQuoteCustomerName = (quote: any) => {
  const personal = quote.personalInfo ?? {};
  return (
    `${personal.title ?? ''} ${personal.fastName ?? ''} ${
      personal.sureName ?? ''
    }`
      .replace(/\s+/g, ' ')
      .trim() || 'Customer'
  );
};

const getQuoteSubtotal = (quote: any) => {
  const product = quote.productId ?? {};
  const controller = quote.controller ?? {};
  const extra = quote.extra ?? {};

  return (
    (product.payablePrice ?? product.price ?? 0) +
    (controller.price ?? 0) +
    (extra.price ?? 0)
  );
};

const getQuoteCouponDiscount = (quote: any) => {
  const subtotal = getQuoteSubtotal(quote);
  const coupon = quote.coupon ?? null;

  if (!coupon) return 0;

  return coupon.type === 'percentage'
    ? Math.round((subtotal * coupon.value) / 100)
    : (coupon.value ?? 0);
};

const buildQuoteCouponRow = (quote: any) => {
  const coupon = quote.coupon ?? null;
  if (!coupon) return '';

  return `
      <tr>
        <td style="padding:7px 0;color:#ffffff;font-size:13px;">Coupon</td>
        <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">
          ${escapeHtml(coupon.code ?? 'Applied')} - ${moneyText(getQuoteCouponDiscount(quote))}
        </td>
      </tr>
    `;
};

const buildQuoteQuizRows = (quote: any) =>
  Array.isArray(quote.quizAnswers) && quote.quizAnswers.length
    ? quote.quizAnswers
        .map(
          (qa: any) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;font-weight:bold;">
                  ${escapeHtml(qa.question ?? 'Question')}
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;text-align:right;">
                  ${escapeHtml(qa.answer ?? 'N/A')}
                </td>
              </tr>
            `,
        )
        .join('')
    : `
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#777777;">
            No quiz answers provided.
          </td>
        </tr>
      `;

export const createQuoteSummaryContext = (
  quote: any,
  price?: number | string,
  url?: string,
  apiBaseUrl = 'https://api.yoloheat.com/api/v1',
): EmailRenderContext => {
  const personal = quote.personalInfo ?? {};
  const product = quote.productId ?? {};
  const controller = quote.controller ?? {};
  const extra = quote.extra ?? {};
  const subtotal = getQuoteSubtotal(quote);
  const coupon = quote.coupon ?? null;
  const finalTotal = getQuoteTotal(quote, price);
  const quoteReference = String(quote.referenceNo ?? quote._id ?? 'N/A');
  const viewQuoteUrl =
    normalizeExternalUrl(url) || normalizeExternalUrl(quote.viewQuoteUrl) || '#';

  return {
    'customer.fullName': getQuoteCustomerName(quote),
    'customer.email': personal.email ?? 'N/A',
    'customer.mobile': personal.mobleNumber ?? 'N/A',
    'customer.postcode': personal.postcode ?? 'N/A',
    'quote.productTitle': product.title ?? 'N/A',
    'quote.controllerTitle': controller.title ?? 'N/A',
    'quote.extraTitle': extra.title ?? 'N/A',
    'quote.subtotal': moneyText(subtotal),
    'quote.couponCode': coupon?.code ?? 'Applied',
    'quote.couponDiscount': moneyText(getQuoteCouponDiscount(quote)),
    'quote.total': moneyText(finalTotal),
    'quote.reference': quoteReference,
    'quote.viewQuoteUrl': viewQuoteUrl,
    'quote.downloadUrl': `${apiBaseUrl}/quote/${quoteReference}/download`,
    'quote.surveyDate': formatDateText(quote.surveyDate),
    'quote.installDate': formatDateText(quote.installDate),
    'quote.installAddress': quote.installAddress ?? 'N/A',
    'quote.couponRow': buildQuoteCouponRow(quote),
    'quote.quizRows': buildQuoteQuizRows(quote),
    'template.year': new Date().getFullYear(),
  };
};

const normalizeImage = (item?: any) =>
  Array.isArray(item?.images) ? item.images.find(Boolean) : undefined;

const buildFollowUpProductRows = (items: {
  product?: any;
  controller?: any;
  extra?: any;
}) => {
  const selectedItems = [
    {
      label: 'Boiler',
      item: items.product,
      image: normalizeImage(items.product),
      price: items.product?.payablePrice ?? items.product?.price ?? 0,
    },
    {
      label: 'Controller',
      item: items.controller,
      image: normalizeImage(items.controller),
      price: items.controller?.price ?? 0,
    },
    {
      label: 'Extra',
      item: items.extra,
      image: normalizeImage(items.extra),
      price: items.extra?.price ?? 0,
    },
  ].filter(({ item, image }) => item?.title || image);

  return selectedItems
    .map(({ label, item, image, price }, index) => {
      const safeTitle = escapeHtml(item?.title || label);
      const safeImage = image ? escapeHtmlAttribute(image) : '';
      const textCell = `
        <td class="quote-row-copy" width="50%" valign="middle">
          <div class="quote-row-title">${safeTitle}</div>
          <div class="quote-row-subtitle">${label}</div>
          <div class="quote-row-price">${moneyTextWithPence(price)}</div>
        </td>
      `;
      const imageCell = `
        <td class="quote-row-image-cell" width="50%" valign="middle">
          ${
            safeImage
              ? `<img src="${safeImage}" alt="${safeTitle}" width="220" class="quote-row-image" />`
              : ''
          }
        </td>
      `;

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="quote-row">
          <tr>
            ${index % 2 === 0 ? textCell + imageCell : imageCell + textCell}
          </tr>
        </table>
        ${
          index < selectedItems.length - 1
            ? '<div class="quote-row-divider"></div>'
            : ''
        }
      `;
    })
    .join('');
};

export const createFollowUpContext = (
  name: string,
  quoteTotal: number,
  items: { product?: any; controller?: any; extra?: any } = {},
): EmailRenderContext => {
  const heroImage =
    normalizeImage(items.product) ||
    normalizeImage(items.controller) ||
    normalizeImage(items.extra) ||
    '';

  return {
    'customer.name': name || 'there',
    'quote.total': moneyTextWithPence(quoteTotal),
    'quote.heroImageUrl': heroImage,
    'quote.productRows': buildFollowUpProductRows(items),
    'template.year': new Date().getFullYear(),
  };
};

export const createReferContext = (
  name: string,
  referredBy?: string,
): EmailRenderContext => ({
  'customer.name': name || 'there',
  'refer.referredBy': referredBy || 'someone you know',
  'template.year': new Date().getFullYear(),
});

export const createIssueContext = (issue: any): EmailRenderContext => ({
  'issue.name': issue.name ?? '',
  'issue.email': issue.email ?? '',
  'issue.phone': issue.phone || 'N/A',
  'issue.message': issue.message || 'N/A',
  'issue.submittedAt': formatLondonDateTime(),
  'template.year': new Date().getFullYear(),
});

export const createPasswordResetContext = (
  otp: string | number,
): EmailRenderContext => ({
  'auth.otp': otp,
});

export const createSubscriberBroadcastContext = (
  name: string,
  message: string,
  attachmentUrl?: string,
): EmailRenderContext => ({
  'customer.name': name,
  'message.text': message,
  'attachment.url': attachmentUrl ?? '',
  'attachment.block': attachmentUrl
    ? `<div class="attachment"><img src="${escapeHtmlAttribute(attachmentUrl)}" alt="Attachment" /></div>`
    : '',
  'template.year': new Date().getFullYear(),
});

export const createCallbackContext = (payload: any): EmailRenderContext => ({
  'callback.name': payload.name ?? '',
  'callback.phoneNumber': payload.phoneNumber || 'Not provided',
  'callback.reason': payload.reason || 'Not provided',
  'callback.submittedAt': formatLondonDateTime(),
});

export const createManualQuoteContext = (
  description: string,
  quote: any,
): EmailRenderContext => {
  const personal = quote.personalInfo ?? {};
  const product = quote.productId ?? {};
  const controller = quote.controller ?? {};
  const extra = quote.extra ?? {};
  const customerName = getQuoteCustomerName(quote);

  return {
    'customer.name': customerName,
    'customer.email': personal.email ?? 'N/A',
    'customer.phone': personal.mobleNumber ?? 'N/A',
    'customer.postcode': personal.postcode ?? 'N/A',
    'quote.installAddress': quote.installAddress ?? 'N/A',
    'quote.reference': String(quote._id ?? 'N/A'),
    'quote.productTitle': product.title ?? 'Selected boiler',
    'quote.productPrice': moneyTextWithPence(product.payablePrice ?? product.price ?? 0),
    'quote.controllerTitle': controller.title ?? 'Not selected',
    'quote.controllerPrice': moneyTextWithPence(controller.price ?? 0),
    'quote.extraTitle': extra.title ?? 'Not selected',
    'quote.extraPrice': moneyTextWithPence(extra.price ?? 0),
    'quote.total': moneyTextWithPence(getQuoteTotal(quote)),
    'message.html': escapeHtml(description).replace(/\n/g, '<br />'),
  };
};

export const createInvoiceWrapperContext = (
  invoiceHtml: string,
  invoiceNumber: string,
): EmailRenderContext => ({
  'invoice.html': invoiceHtml,
  'invoice.number': invoiceNumber,
  'template.year': new Date().getFullYear(),
});

export { escapeHtml, escapeHtmlAttribute };
