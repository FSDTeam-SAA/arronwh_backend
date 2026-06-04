import { invoiceEmailWrapper } from 'src/app/helpers/invoice-email.template';
import { issueEmailTemplate } from 'src/app/helpers/issueEmailTemplate';
import { quoteEmailTemplate } from 'src/app/helpers/quoteEmailTemplate';
import {
  buildEmailHtml,
  buildFollowUpEmail,
  buildReferEmail,
} from 'src/app/helpers/template';

export type EmailTemplateVariableDefinition = {
  key: string;
  label: string;
  description?: string;
  sampleValue?: string;
  required?: boolean;
};

export type EmailTemplateDefinition = {
  key: string;
  name: string;
  description: string;
  defaultSubject: string;
  defaultHtml: string;
  variables: EmailTemplateVariableDefinition[];
};

const token = (key: string) => `{{${key}}}`;
const rawToken = (key: string) => `{{{${key}}}}`;

const replaceAll = (value: string, search: string, replacement: string) =>
  value.split(search).join(replacement);

const replaceMany = (
  value: string,
  replacements: Array<[string, string]>,
) =>
  replacements.reduce(
    (current, [search, replacement]) =>
      search ? replaceAll(current, search, replacement) : current,
    value,
  );

const quoteSample = {
  _id: 'QUOTE-SAMPLE-123',
  referenceNo: 'QTE-SAMPLE-123',
  personalInfo: {
    title: 'Mr',
    fastName: 'Alex',
    sureName: 'Morgan',
    email: 'alex.morgan@example.com',
    mobleNumber: '07123 456789',
    postcode: 'SW1A 1AA',
  },
  productId: {
    title: 'Greenstar 4000 Combi',
    price: 2600,
    payablePrice: 2499,
    images: [
      'https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.17_AM_igzmyi.jpg',
    ],
  },
  controller: {
    title: 'Hive Mini Thermostat',
    price: 149,
    images: [
      'https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_1_ccu1gb.jpg',
    ],
  },
  extra: {
    title: 'Magnetic Filter',
    price: 120,
    images: [
      'https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_2_d4tfyq.jpg',
    ],
  },
  coupon: {
    type: 'fixed',
    value: 100,
    code: 'SAVE100',
  },
  surveyDate: '2026-05-25T00:00:00.000Z',
  installDate: '2026-05-30T00:00:00.000Z',
  installAddress: '221B Baker Street, London',
  quizAnswers: [{ question: 'How many bedrooms?', answer: '3 bedrooms' }],
};

const quoteApiBaseUrl = 'https://api.yoloheat.test/api/v1';
const quoteViewUrl = 'https://yoloheat.co.uk/quote/sample';

const quoteVariables: EmailTemplateVariableDefinition[] = [
  {
    key: 'customer.fullName',
    label: 'Customer full name',
    sampleValue: 'Mr Alex Morgan',
    required: true,
  },
  {
    key: 'customer.email',
    label: 'Customer email',
    sampleValue: 'alex.morgan@example.com',
  },
  {
    key: 'customer.mobile',
    label: 'Customer mobile',
    sampleValue: '07123 456789',
  },
  {
    key: 'customer.postcode',
    label: 'Customer postcode',
    sampleValue: 'SW1A 1AA',
  },
  {
    key: 'quote.productTitle',
    label: 'Boiler title',
    sampleValue: 'Greenstar 4000 Combi',
    required: true,
  },
  {
    key: 'quote.controllerTitle',
    label: 'Controller title',
    sampleValue: 'Hive Mini Thermostat',
  },
  {
    key: 'quote.extraTitle',
    label: 'Extra title',
    sampleValue: 'Magnetic Filter',
  },
  {
    key: 'quote.subtotal',
    label: 'Quote subtotal',
    sampleValue: '£2,768',
  },
  {
    key: 'quote.total',
    label: 'Quote total',
    sampleValue: '£2,668',
    required: true,
  },
  {
    key: 'quote.reference',
    label: 'Quote reference',
    sampleValue: 'QTE-SAMPLE-123',
  },
  {
    key: 'quote.viewQuoteUrl',
    label: 'View quote URL',
    sampleValue: quoteViewUrl,
  },
  {
    key: 'quote.downloadUrl',
    label: 'Download quote URL',
    sampleValue: `${quoteApiBaseUrl}/quote/QTE-SAMPLE-123/download`,
  },
  {
    key: 'quote.surveyDate',
    label: 'Survey date',
    sampleValue: '25/05/2026',
  },
  {
    key: 'quote.installDate',
    label: 'Install date',
    sampleValue: '30/05/2026',
  },
  {
    key: 'quote.installAddress',
    label: 'Install address',
    sampleValue: '221B Baker Street, London',
  },
  {
    key: 'quote.couponRow',
    label: 'Coupon row HTML',
    description: 'Use triple braces so the coupon row can be hidden when unused.',
    sampleValue: rawToken('quote.couponRow'),
  },
  {
    key: 'quote.quizRows',
    label: 'Survey answers HTML',
    description: 'Use triple braces so all survey answers remain dynamic.',
    sampleValue: rawToken('quote.quizRows'),
  },
  {
    key: 'template.year',
    label: 'Current year',
    sampleValue: String(new Date().getFullYear()),
  },
];

const createQuoteSummaryHtml = () => {
  let html = quoteEmailTemplate(quoteSample, undefined, quoteViewUrl, quoteApiBaseUrl);

  html = html.replace(
    /<tr>\s*<td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Coupon[\s\S]*?<\/tr>/,
    rawToken('quote.couponRow'),
  );
  html = html.replace(
    /<tr>\s*<td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;font-weight:bold;">\s*How many bedrooms\?\s*<\/td>\s*<td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;text-align:right;">\s*3 bedrooms\s*<\/td>\s*<\/tr>/,
    rawToken('quote.quizRows'),
  );

  return replaceMany(html, [
    ['Mr Alex Morgan', token('customer.fullName')],
    ['alex.morgan@example.com', token('customer.email')],
    ['07123 456789', token('customer.mobile')],
    ['SW1A 1AA', token('customer.postcode')],
    ['Greenstar 4000 Combi', token('quote.productTitle')],
    ['Hive Mini Thermostat', token('quote.controllerTitle')],
    ['Magnetic Filter', token('quote.extraTitle')],
    ['£2,768', token('quote.subtotal')],
    ['£100', token('quote.couponDiscount')],
    ['SAVE100', token('quote.couponCode')],
    ['£2,668', token('quote.total')],
    ['QTE-SAMPLE-123', token('quote.reference')],
    [quoteViewUrl, token('quote.viewQuoteUrl')],
    [`${quoteApiBaseUrl}/quote/${quoteSample.referenceNo}/download`, token('quote.downloadUrl')],
    ['25/05/2026', token('quote.surveyDate')],
    ['30/05/2026', token('quote.installDate')],
    ['221B Baker Street, London', token('quote.installAddress')],
    [String(new Date().getFullYear()), token('template.year')],
  ]);
};

const followUpItems = {
  product: quoteSample.productId,
  controller: quoteSample.controller,
  extra: quoteSample.extra,
};

const followUpVariables: EmailTemplateVariableDefinition[] = [
  {
    key: 'customer.name',
    label: 'Customer first name',
    sampleValue: 'Alex',
    required: true,
  },
  {
    key: 'quote.total',
    label: 'Quote total',
    sampleValue: '£2,668.00',
    required: true,
  },
  {
    key: 'quote.heroImageUrl',
    label: 'Hero product image URL',
  },
  {
    key: 'quote.productRows',
    label: 'Selected products HTML',
    description: 'Use triple braces so boiler, controller, and extras stay dynamic.',
  },
  {
    key: 'template.year',
    label: 'Current year',
  },
];

const createFollowUpHtml = (isFinalReminder: boolean) => {
  let html = buildFollowUpEmail('Alex', 2668, isFinalReminder, followUpItems);

  html = html.replace(
    /<div class="product-grid">[\s\S]*?<\/div>\s*(?=<div class="follow-message">)/,
    `<div class="product-grid">${rawToken('quote.productRows')}</div>`,
  );

  return replaceMany(html, [
    ['Alex', token('customer.name')],
    ['£2,668.00', token('quote.total')],
    [quoteSample.productId.images[0], token('quote.heroImageUrl')],
    [String(new Date().getFullYear()), token('template.year')],
  ]);
};

const createReferHtml = () =>
  replaceMany(buildReferEmail('Alex', 'Jamie'), [
    ['Alex', token('customer.name')],
    ['Jamie', token('refer.referredBy')],
    [String(new Date().getFullYear()), token('template.year')],
  ]);

const createIssueHtml = () => {
  const submittedAt = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
  });
  return replaceMany(
    issueEmailTemplate({
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '07123 456789',
      message: 'The heating is not working correctly.',
    } as any),
    [
      ['Alex Morgan', token('issue.name')],
      ['alex.morgan@example.com', token('issue.email')],
      ['07123 456789', token('issue.phone')],
      ['The heating is not working correctly.', token('issue.message')],
      [submittedAt, token('issue.submittedAt')],
      [String(new Date().getFullYear()), token('template.year')],
    ],
  );
};

const createSubscriberBroadcastHtml = () => {
  let html = buildEmailHtml(
    'Alex',
    'Your boiler service reminder is ready.',
    'https://yoloheat.co.uk/sample-attachment.jpg',
  );

  html = html.replace(
    /<div class="attachment">[\s\S]*?<\/div>/,
    rawToken('attachment.block'),
  );

  return replaceMany(html, [
    ['Alex', token('customer.name')],
    ['Your boiler service reminder is ready.', token('message.text')],
    [String(new Date().getFullYear()), token('template.year')],
  ]);
};

const createPasswordResetHtml = () => `
    <div style="font-family: Arial; text-align: center;">
      <h2 style="color:#4f46e5;">Password Reset OTP</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing:4px;">${token('auth.otp')}</h1>
      <p>This code will expire in 1 hour.</p>
    </div>
  `;

const createCallbackHtml = () => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>YOLO HEAT Callback Request</title>
        <style>
          body { margin: 0; padding: 0; background: #f3f5f8; font-family: Arial, sans-serif; }
          .wrapper { max-width: 620px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #dde5ee; box-shadow: 0 8px 24px rgba(17, 46, 82, 0.08); }
          .brand { background: #e8ff00; padding: 18px 28px; color: #102f52; font-size: 14px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; }
          .header { background: #dfe7ef; padding: 28px 32px; border-bottom: 4px solid #e8ff00; }
          .header h1 { color: #102f52; margin: 0; font-size: 28px; line-height: 1.2; font-weight: 800; }
          .header p { color: #354a60; margin: 10px 0 0; font-size: 15px; line-height: 1.6; }
          .body { padding: 28px 32px 32px; color: #102f52; }
          .summary { background: #f7f9fb; border: 1px solid #dde5ee; border-radius: 10px; overflow: hidden; }
          .row { border-bottom: 1px solid #dde5ee; padding: 16px 18px; }
          .row:last-child { border-bottom: none; }
          .label { color: #53677d; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
          .value { color: #102f52; font-size: 16px; font-weight: 800; line-height: 1.4; }
          .phone { color: #00a879; }
          .footer { background: #102f52; padding: 18px 32px; text-align: center; font-size: 12px; color: #dfe7ef; }
          .footer strong { color: #e8ff00; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="brand">YOLO HEAT</div>
          <div class="header">
            <h1>New Callback Request</h1>
            <p>A customer submitted a callback request from the website.</p>
          </div>
          <div class="body">
            <div class="summary">
              <div class="row">
                <div class="label">Name</div>
                <div class="value">${token('callback.name')}</div>
              </div>
              <div class="row">
                <div class="label">Phone Number</div>
                <div class="value phone">${token('callback.phoneNumber')}</div>
              </div>
              <div class="row">
                <div class="label">Reason</div>
                <div class="value">${token('callback.reason')}</div>
              </div>
              <div class="row">
                <div class="label">Submitted</div>
                <div class="value">${token('callback.submittedAt')}</div>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Automated notification from <strong>YOLO HEAT</strong> website.</p>
          </div>
        </div>
      </body>
      </html>
    `;

const createManualQuoteHtml = () => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>YOLO HEAT Quote Details</title>
        <style>
          body { margin: 0; padding: 0; background: #EAEBEC; font-family: Arial, Helvetica, sans-serif; color: #1A2E1A; }
          .wrapper { max-width: 680px; margin: 32px auto; background: #ffffff; border: 1px solid #d6d8da; overflow: hidden; }
          .brand { background: #EAEBEC; padding: 24px 30px; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #1A2E1A; }
          .company { margin-top: 8px; font-size: 12px; line-height: 1.6; color: #435343; }
          .hero { background: #FBFF26; padding: 28px 30px; }
          .hero h1 { margin: 0; font-size: 26px; line-height: 1.25; color: #1A2E1A; }
          .hero p { margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: #263a26; }
          .body { padding: 28px 30px 32px; }
          .message { background: #D0E7D5; border: 1px solid #b9d2bf; padding: 18px; font-size: 15px; line-height: 1.7; color: #263a26; }
          .section { margin-top: 22px; }
          .section-title { margin: 0 0 10px; font-size: 15px; font-weight: 900; color: #1A2E1A; text-transform: uppercase; letter-spacing: .04em; }
          .table { width: 100%; border-collapse: collapse; border: 1px solid #e1e5e1; }
          .table td { padding: 12px 14px; border-bottom: 1px solid #e1e5e1; font-size: 14px; vertical-align: top; }
          .table tr:last-child td { border-bottom: none; }
          .label { width: 38%; color: #617064; font-weight: 700; }
          .value { color: #1A2E1A; font-weight: 700; text-align: right; }
          .total { margin-top: 22px; background: #1A2E1A; color: #ffffff; padding: 18px; text-align: right; }
          .total span { display: block; font-size: 12px; color: #D0E7D5; text-transform: uppercase; letter-spacing: .06em; }
          .total strong { display: block; margin-top: 6px; font-size: 28px; color: #FBFF26; }
          .footer { background: #1A2E1A; color: #EAEBEC; padding: 18px 30px; text-align: center; font-size: 12px; line-height: 1.6; }
          .footer a { color: #FBFF26; text-decoration: none; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="brand">
            <div class="logo">■ YOLO HEAT</div>
            <div class="company">
              YOLO HEAT LTD · Heating & Installation Specialists<br />
              London, United Kingdom · <a href="mailto:hello@yoloheat.co.uk" style="color:#1A2E1A;">hello@yoloheat.co.uk</a> · yoloheat.co.uk
            </div>
          </div>

          <div class="hero">
            <h1>Your quote details</h1>
            <p>Here is the full quote information prepared by YOLO HEAT.</p>
          </div>

          <div class="body">
            <div class="message">
              Hi ${token('customer.name')},<br /><br />
              ${rawToken('message.html')}
            </div>

            <div class="section">
              <h2 class="section-title">Customer Information</h2>
              <table class="table">
                <tr><td class="label">Name</td><td class="value">${token('customer.name')}</td></tr>
                <tr><td class="label">Email</td><td class="value">${token('customer.email')}</td></tr>
                <tr><td class="label">Phone</td><td class="value">${token('customer.phone')}</td></tr>
                <tr><td class="label">Postcode</td><td class="value">${token('customer.postcode')}</td></tr>
                <tr><td class="label">Install Address</td><td class="value">${token('quote.installAddress')}</td></tr>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">Quote Selection</h2>
              <table class="table">
                <tr><td class="label">Quote ID</td><td class="value">${token('quote.reference')}</td></tr>
                <tr><td class="label">Product</td><td class="value">${token('quote.productTitle')}</td></tr>
                <tr><td class="label">Product Price</td><td class="value">${token('quote.productPrice')}</td></tr>
                <tr><td class="label">Controller</td><td class="value">${token('quote.controllerTitle')}</td></tr>
                <tr><td class="label">Controller Price</td><td class="value">${token('quote.controllerPrice')}</td></tr>
                <tr><td class="label">Extra</td><td class="value">${token('quote.extraTitle')}</td></tr>
                <tr><td class="label">Extra Price</td><td class="value">${token('quote.extraPrice')}</td></tr>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">Company Information</h2>
              <table class="table">
                <tr><td class="label">Company</td><td class="value">YOLO HEAT LTD</td></tr>
                <tr><td class="label">Email</td><td class="value">hello@yoloheat.co.uk</td></tr>
                <tr><td class="label">Website</td><td class="value">yoloheat.co.uk</td></tr>
                <tr><td class="label">Location</td><td class="value">London, United Kingdom</td></tr>
              </table>
            </div>

            <div class="total">
              <span>Full quote total</span>
              <strong>${token('quote.total')}</strong>
            </div>
          </div>

          <div class="footer">
            You are receiving this email because you requested a quote from YOLO HEAT.<br />
            Contact us: <a href="mailto:hello@yoloheat.co.uk">hello@yoloheat.co.uk</a>
          </div>
        </div>
      </body>
      </html>
    `;

const createInvoiceWrapperHtml = () =>
  invoiceEmailWrapper(rawToken('invoice.html'), token('invoice.number')).replace(
    String(new Date().getFullYear()),
    token('template.year'),
  );

export const getEmailTemplateDefinitions = (): EmailTemplateDefinition[] => [
  {
    key: 'quote-summary',
    name: 'Quote Summary Email',
    description: 'Sent when a customer receives their saved boiler quote.',
    defaultSubject: 'Your Quote Summary',
    defaultHtml: createQuoteSummaryHtml(),
    variables: quoteVariables,
  },
  {
    key: 'follow-up-first',
    name: 'First Quote Follow-up',
    description: 'Automatic reminder for customers who have not completed booking.',
    defaultSubject: 'Still thinking? Your quote is saved!',
    defaultHtml: createFollowUpHtml(false),
    variables: followUpVariables,
  },
  {
    key: 'follow-up-final',
    name: 'Final Quote Reminder',
    description: 'Last automatic reminder before the saved quote expires.',
    defaultSubject: 'Last reminder - your boiler quote is ready',
    defaultHtml: createFollowUpHtml(true),
    variables: followUpVariables,
  },
  {
    key: 'refer-friend',
    name: 'Refer Friend Email',
    description: 'Sent to people referred to YOLO HEAT.',
    defaultSubject: 'You have been referred to YOLO HEAT',
    defaultHtml: createReferHtml(),
    variables: [
      { key: 'customer.name', label: 'Customer name', sampleValue: 'Alex' },
      { key: 'refer.referredBy', label: 'Referred by', sampleValue: 'Jamie' },
      { key: 'template.year', label: 'Current year' },
    ],
  },
  {
    key: 'issue-notification',
    name: 'Issue Notification',
    description: 'Sent to admin when a customer raises an issue.',
    defaultSubject: 'New issue submitted - YOLO HEAT',
    defaultHtml: createIssueHtml(),
    variables: [
      { key: 'issue.name', label: 'Customer name', sampleValue: 'Alex Morgan' },
      { key: 'issue.email', label: 'Customer email', sampleValue: 'alex.morgan@example.com' },
      { key: 'issue.phone', label: 'Customer phone', sampleValue: '07123 456789' },
      { key: 'issue.message', label: 'Issue message' },
      { key: 'issue.submittedAt', label: 'Submitted date' },
      { key: 'template.year', label: 'Current year' },
    ],
  },
  {
    key: 'subscriber-broadcast',
    name: 'Subscriber Broadcast',
    description: 'Sent from subscriber/customer broadcast messages.',
    defaultSubject: '{{message.subject}}',
    defaultHtml: createSubscriberBroadcastHtml(),
    variables: [
      { key: 'message.subject', label: 'Email subject' },
      { key: 'customer.name', label: 'Customer name', sampleValue: 'Alex' },
      { key: 'message.text', label: 'Message body' },
      { key: 'attachment.block', label: 'Attachment image block' },
      { key: 'template.year', label: 'Current year' },
    ],
  },
  {
    key: 'callback-request',
    name: 'Callback Request',
    description: 'Sent to admin when a callback request arrives.',
    defaultSubject: '{{callback.subject}}',
    defaultHtml: createCallbackHtml(),
    variables: [
      { key: 'callback.subject', label: 'Email subject' },
      { key: 'callback.name', label: 'Customer name' },
      { key: 'callback.phoneNumber', label: 'Phone number' },
      { key: 'callback.reason', label: 'Reason' },
      { key: 'callback.submittedAt', label: 'Submitted date' },
    ],
  },
  {
    key: 'manual-quote-details',
    name: 'Manual Quote Details',
    description: 'Sent when admin manually sends full quote details.',
    defaultSubject: 'Your YOLO HEAT quote details',
    defaultHtml: createManualQuoteHtml(),
    variables: [
      { key: 'customer.name', label: 'Customer name' },
      { key: 'customer.email', label: 'Customer email' },
      { key: 'customer.phone', label: 'Customer phone' },
      { key: 'customer.postcode', label: 'Customer postcode' },
      { key: 'message.html', label: 'Admin message HTML' },
      { key: 'quote.reference', label: 'Quote ID' },
      { key: 'quote.productTitle', label: 'Product' },
      { key: 'quote.productPrice', label: 'Product price' },
      { key: 'quote.controllerTitle', label: 'Controller' },
      { key: 'quote.controllerPrice', label: 'Controller price' },
      { key: 'quote.extraTitle', label: 'Extra' },
      { key: 'quote.extraPrice', label: 'Extra price' },
      { key: 'quote.total', label: 'Quote total' },
      { key: 'quote.installAddress', label: 'Install address' },
    ],
  },
  {
    key: 'password-reset-otp',
    name: 'Password Reset OTP',
    description: 'Sent when an admin or customer requests a password reset OTP.',
    defaultSubject: 'Reset Password OTP',
    defaultHtml: createPasswordResetHtml(),
    variables: [{ key: 'auth.otp', label: 'OTP code', required: true }],
  },
  {
    key: 'invoice-email-wrapper',
    name: 'Invoice Email Wrapper',
    description: 'Outer email shell used when sending invoices.',
    defaultSubject: 'Your Invoice {{invoice.number}} - Yolo Heat',
    defaultHtml: createInvoiceWrapperHtml(),
    variables: [
      { key: 'invoice.number', label: 'Invoice number', required: true },
      { key: 'invoice.html', label: 'Invoice HTML' },
      { key: 'template.year', label: 'Current year' },
    ],
  },
];
