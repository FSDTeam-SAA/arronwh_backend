export const quoteEmailTemplate = (
  quote: any,
  price?: number,
  url?: string,
  apiBaseUrl: string = 'http://localhost:5001/api/v1',
): string => {
  const personal = quote.personalInfo ?? {};
  const product = quote.productId ?? {};
  const controller = quote.controller ?? {};
  const extra = quote.extra ?? {};

  const money = (value?: number) =>
    typeof value === 'number' && !Number.isNaN(value)
      ? `£${value.toLocaleString('en-GB')}`
      : 'N/A';

  const formatDate = (date?: Date | string) =>
    date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';

  const fullName =
    `${personal.title ?? ''} ${personal.fastName ?? ''} ${personal.sureName ?? ''}`.trim();

  const escapeHtmlAttribute = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const normalizeExternalUrl = (value?: string): string | undefined => {
    if (typeof value !== 'string') return undefined;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^www\./i.test(trimmed)) return `https://${trimmed}`;

    return undefined;
  };

  const preInstallSurveyIconUrl =
    normalizeExternalUrl(quote.preInstallSurveyIconUrl) ||
    'https://cdn-icons-png.flaticon.com/512/190/190411.png';
  const safePreInstallSurveyIconUrl = escapeHtmlAttribute(
    preInstallSurveyIconUrl,
  );

  const boilerPrice = product.payablePrice ?? product.price ?? 0;
  const controllerPrice = controller.price ?? 0;
  const extraPrice = extra.price ?? 0;

  const subtotal = boilerPrice + controllerPrice + extraPrice;

  const coupon = quote.coupon ?? null;
  const couponDiscount =
    coupon?.type === 'percentage'
      ? Math.round((subtotal * coupon.value) / 100)
      : (coupon?.value ?? 0);

  const calculatedTotal = Math.max(subtotal - couponDiscount, 0);

  const finalTotal =
    typeof price === 'number' && !Number.isNaN(price) ? price : calculatedTotal;

  // const savedQuotePrice =
  //   typeof quote.quotePrice === 'number' && !Number.isNaN(quote.quotePrice)
  //     ? quote.quotePrice
  //     : undefined;

  // const finalTotal =
  //   typeof price === 'number' && !Number.isNaN(price)
  //     ? price
  //     : (savedQuotePrice ?? calculatedTotal);

  const resolvedViewQuoteUrl =
    normalizeExternalUrl(url) || normalizeExternalUrl(quote.viewQuoteUrl) || '#';
  const viewQuoteUrl =
    resolvedViewQuoteUrl === '#'
      ? resolvedViewQuoteUrl
      : escapeHtmlAttribute(resolvedViewQuoteUrl);

  const quoteReference = quote.referenceNo ?? quote._id ?? 'N/A';

  const downloadUrl = escapeHtmlAttribute(
    `${apiBaseUrl}/quote/${quoteReference}/download`,
  );

  const quizRows =
    Array.isArray(quote.quizAnswers) && quote.quizAnswers.length
      ? quote.quizAnswers
          .map(
            (qa: any) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;font-weight:bold;">
                  ${qa.question ?? 'Question'}
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;text-align:right;">
                  ${qa.answer ?? 'N/A'}
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

  const couponSection = coupon
    ? `
      <tr>
        <td style="padding:7px 0;color:#ffffff;font-size:13px;">Coupon</td>
        <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">
          ${coupon.code ?? 'Applied'} - ${money(couponDiscount)}
        </td>
      </tr>
    `
    : '';

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your boiler quote</title>

    <style>
      @media only screen and (max-width: 640px) {
        .email-container {
          width: 100% !important;
        }

        .content {
          padding-left: 18px !important;
          padding-right: 18px !important;
        }

        .hero-title {
          font-size: 22px !important;
          line-height: 30px !important;
        }

        .two-col,
        .two-col td {
          display: block !important;
          width: 100% !important;
          text-align: left !important;
        }

        .icon-box {
          margin-bottom: 16px !important;
        }

        .mobile-center {
          text-align: center !important;
        }

        .button {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
      }
    </style>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background: #eef1f4;
      font-family: Arial, Helvetica, sans-serif;
      color: #344150;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background: #eef1f4; padding: 28px 0"
    >
      <tr>
        <td align="center">
          <table
            class="email-container"
            width="540"
            cellpadding="0"
            cellspacing="0"
            style="width: 540px; background: #ffffff"
          >
            <tr>
              <td align="center" style="padding: 26px 20px 14px">
                <div>
                  <div
                    style="
                      display: inline-block;
                      background-color: #ffde59;
                      padding: 14px 32px;
                      font-size: 20px;
                      letter-spacing: 6px;
                      font-weight: 600;
                      border-radius: 4px;
                      color: #000;
                      font-family:
                        &quot;Helvetica Neue&quot;, Arial, sans-serif;
                    "
                  >
                    YOLO HEAT
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px">
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="background: #00A56F"
                >
                  <tr>
                    <td align="center" style="padding: 34px 26px 28px">
                      <h1
                        class="hero-title"
                        style="
                          margin: 0;
                          color: #ffffff;
                          font-size: 28px;
                          line-height: 36px;
                          font-weight: bold;
                        "
                      >
                        Your fixed price quote for a<br />
                        ${product.title ?? 'new boiler'} has<br />
                        been saved
                      </h1>

                      <p
                        style="
                          margin: 28px 0 8px;
                          color: #ffffff;
                          font-size: 12px;
                        "
                      >
                        Your fixed price, including installation:
                      </p>

                      <div
                        style="
                          font-size: 28px;
                          font-weight: bold;
                          color: #ffffff;
                        "
                      >
                        ${money(finalTotal)}
                      </div>

                      <p
                        style="
                          margin: 16px 0 0;
                          color: #ffffff;
                          font-size: 12px;
                          line-height: 18px;
                        "
                      >
                        Your tailored quote has been saved, and your price is
                        locked in for 30 days. Your fixed price includes
                        everything needed to get your new boiler up and running,
                        so there are no hidden extra costs.
                      </p>
                    </td>
                  </tr>
                </table>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="background: #344150"
                >
                  <tr>
                    <!-- <td style="padding:8px 12px;color:#ffffff;font-size:10px;font-weight:bold;">
                    REFERENCE QUOTE: ${quoteReference}
                  </td> -->
                  </tr>
                </table>
              </td>
            </tr>

            <!-- View Quote Button -->
            <tr>
              <td align="center" style="padding: 20px 20px 8px">
                <a
                  href="${viewQuoteUrl}"
                  class="button"
                  style="
                    background: #00a878;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: bold;
                    padding: 10px 22px;
                    display: inline-block;
                  "
                >
                  View quote
                </a>
              </td>
            </tr>

            <!-- Download Quote Button -->
            <tr>
              <td align="center" style="padding: 4px 20px 8px">
                <a
                  href="${downloadUrl}"
                  class="button"
                  style="
                    background: #344150;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: bold;
                    padding: 10px 22px;
                    display: inline-block;
                  "
                >
                  ⬇ Download quote
                </a>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                style="padding: 4px 20px 22px; font-size: 16px; color: #344150"
              >
                Excellent &nbsp;
                <span
                  style="background: #00b67a; color: #ffffff; padding: 3px 6px"
                  >★ ★ ★ ★ ★</span
                >
                &nbsp; based on 58,120 reviews &nbsp;
                <strong style="color: #00b67a">★ Trustpilot</strong>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                class="content"
                style="padding: 0 26px 18px; border-top: 1px solid #dddddd"
              >
                <h2
                  style="
                    margin: 22px 0 0;
                    color: #344150;
                    font-size: 25px;
                    line-height: 32px;
                  "
                >
                  The smart way to buy a boiler
                </h2>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 22px">
                <table
                  class="two-col"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.17_AM_igzmyi.jpg"
                        alt="Pre-install suitability survey"
                        width="100"
                        height="100"
                        style="
                          display: block;
                          width: 100%;
                          height: 250px;
                          border: 0;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                    </td>
                    <td width="50%" style="padding: 20px 0 20px 24px">
                      <h3
                        style="
                          margin: 0 0 8px;
                          color: #ff5b57;
                          font-size: 19px;
                          line-height: 22px;
                        "
                      >
                        Pre-install suitability survey
                      </h3>
                      <p
                        style="
                          margin: 0;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 19px;
                        "
                      >
                        Our in-house experts will double check that everything
                        you have selected is perfect for your home.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 22px">
                <table
                  class="two-col"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td width="50%" style="padding: 20px 24px 20px 0">
                      <h3
                        style="
                          margin: 0 0 8px;
                          color: #ff5b57;
                          font-size: 19px;
                          line-height: 22px;
                        "
                      >
                        Post-install quality check
                      </h3>
                      <p
                        style="
                          margin: 0;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 19px;
                        "
                      >
                        After your new boiler has been installed, our quality
                        team checks the work.
                      </p>
                    </td>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.17_AM_1_b6dmmm.jpg"
                        alt="Post-install quality check"
                        width="100"
                        height="100"
                        style="
                          display: block;
                          width: 100%;
                          height: 250px;
                          border: 0;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 22px">
                <table
                  class="two-col"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_udsl5d.jpg"
                        alt="Qualified and checked local installers"
                        width="100"
                        height="100"
                        style="
                          display: block;
                          width: 100%;
                          height: 250px;
                          border: 0;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                    </td>
                    <td width="50%" style="padding: 20px 0 20px 24px">
                      <h3
                        style="
                          margin: 0 0 8px;
                          color: #ff5b57;
                          font-size: 19px;
                          line-height: 22px;
                        "
                      >
                        Qualified and checked local installers
                      </h3>
                      <p
                        style="
                          margin: 0;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 19px;
                        "
                      >
                        To become Yelo Heat accredited, all local installers go
                        through a comprehensive 25-check vetting process,
                        including requiring up to date qualification
                        certificates and DBS checks.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 22px">
                <table
                  class="two-col"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td width="50%" style="padding: 20px 24px 20px 0">
                      <h3
                        style="
                          margin: 0 0 8px;
                          color: #ff5b57;
                          font-size: 19px;
                          line-height: 22px;
                        "
                      >
                        Here to help through installation, and beyond
                      </h3>
                      <p
                        style="
                          margin: 0;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 19px;
                        "
                      >
                        After your new boiler's been installed and signed off by
                        our experts, we're still here to help via our app. Plus,
                        for added peace of mind, you get a one year workmanship
                        guarantee on top of the manufacturer warranty.
                      </p>
                    </td>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_1_ccu1gb.jpg"
                        alt="Here to help"
                        width="100"
                        height="100"
                        style="
                          display: block;
                          width: 100%;
                          height: 250px;
                          border: 0;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 22px">
                <table
                  class="two-col"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_2_d4tfyq.jpg"
                        alt="Flexible payment options"
                        width="100"
                        height="100"
                        style="
                          display: block;
                          width: 100%;
                          height: 250px;
                          border: 0;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                    </td>
                    <td width="50%" style="padding: 20px 0 20px 24px">
                      <h3
                        style="
                          margin: 0 0 8px;
                          color: #ff5b57;
                          font-size: 19px;
                          line-height: 22px;
                        "
                      >
                        Flexible payment options
                      </h3>
                      <p
                        style="
                          margin: 0;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 19px;
                        "
                      >
                        With a range of ways to pay, and our price match
                        promise, rest assured you won't get a better price
                        anywhere else, and you can pay using whichever method
                        you prefer.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 22px">
                <table
                  class="two-col"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td width="50%" style="padding: 20px 24px 20px 0">
                      <h3
                        style="
                          margin: 0 0 8px;
                          color: #ff5b57;
                          font-size: 19px;
                          line-height: 22px;
                        "
                      >
                        Next working day installation
                      </h3>
                      <p
                        style="
                          margin: 0;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 19px;
                        "
                      >
                        When your boiler's not working properly, we know you
                        want heating and hot water back as soon as possible,
                        which is why we offer next working day installation when
                        you order by 3pm*.
                      </p>
                    </td>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_3_o8bjnx.jpg"
                        alt="Next working day installation"
                        width="100"
                        height="100"
                        style="
                          display: block;
                          width: 100%;
                          height: 250px;
                          border: 0;
                          outline: none;
                          text-decoration: none;
                        "
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 26px">
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="background: #00A56F"
                >
                  <tr>
                    <td style="padding: 22px 24px">
                      <h2
                        style="
                          margin: 0 0 14px;
                          color: #ffffff;
                          font-size: 22px;
                          text-align: center;
                        "
                      >
                        Your quote details
                      </h2>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Customer</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${fullName || 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Email</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${personal.email ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Mobile</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${personal.mobleNumber ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Postcode</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${personal.postcode ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Boiler</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${product.title ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Controller</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${controller.title ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Extra</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${extra.title ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px;">Subtotal</td>
                          <td style="padding: 7px 0; color: #ffffff; font-size: 13px; text-align: right;">
                            ${money(subtotal)}
                          </td>
                        </tr>

                        ${couponSection}

                        <tr>
                          <td
                            style="
                              padding: 12px 0 0;
                              color: #ffffff;
                              font-size: 18px;
                              font-weight: bold;
                              border-top: 1px solid rgba(255, 255, 255, 0.45);
                            "
                          >
                            Total
                          </td>
                          <td
                            style="
                              padding: 12px 0 0;
                              color: #ffffff;
                              font-size: 22px;
                              font-weight: bold;
                              text-align: right;
                              border-top: 1px solid rgba(255, 255, 255, 0.45);
                            "
                          >
                            ${money(finalTotal)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 26px">
                <h2
                  style="
                    margin: 0 0 14px;
                    color: #344150;
                    font-size: 24px;
                    text-align: center;
                  "
                >
                  Installation information
                </h2>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    border-top: 1px solid #eeeeee;
                    border-bottom: 1px solid #eeeeee;
                  "
                >
                  <tr>
                    <td style="padding: 10px 0; font-size: 13px; color: #43505c; font-weight: bold;">Survey date</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #43505c; text-align: right;">
                      ${formatDate(quote.surveyDate)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 13px; color: #43505c; font-weight: bold;">Install date</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #43505c; text-align: right;">
                      ${formatDate(quote.installDate)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 13px; color: #43505c; font-weight: bold;">Install address</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #43505c; text-align: right;">
                      ${quote.installAddress ?? 'N/A'}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 28px">
                <h2
                  style="
                    margin: 0 0 14px;
                    color: #344150;
                    font-size: 24px;
                    text-align: center;
                  "
                >
                  Your survey answers
                </h2>

                <table width="100%" cellpadding="0" cellspacing="0">
                  ${quizRows}
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 0 26px 26px">
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="border-top: 1px solid #dddddd; padding-top: 22px"
                >
                  <tr>
                    <td align="center">
                      <h2 style="margin: 0; color: #344150; font-size: 25px">
                        We're here to help
                      </h2>
                      <p
                        style="
                          margin: 14px 0 22px;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 20px;
                        "
                      >
                        We know a new boiler is a big investment and you want to make sure you're choosing the right one for your home, which is why we've fixed your price for 30 days while you decide.
                      </p>

                      <p
                        style="
                          margin: 14px 0 22px;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 20px;
                        "
                      >
                        In the meantime, we're on hand to help answer any questions you might have about your recommended boiler and why it's right for you.
                      </p>

                      <div>
                        <img src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093514/WhatsApp_Image_2026-04-25_at_11.04.44_AM_dgmkoh.jpg" alt="" style="max-width: 100%; height: auto;" />
                      </div>

                      <p
                        style="
                          margin: 14px 0 0;
                          color: #4d5964;
                          font-size: 13px;
                          line-height: 20px;
                        "
                      >
                        Just so you know, every single Yelo Heat order is reviewed before and after installation by our in-house audit team, who are all Gas Safe registered and have over 60 years of boiler installation experience between them. So you can be confident your selected boiler package is a great fit for your heating and hot water needs.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" class="content" style="padding: 0 26px 30px">
                <a
                  href="${viewQuoteUrl}"
                  class="button"
                  style="
                    background: #00a878;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: bold;
                    padding: 11px 24px;
                    display: inline-block;
                  "
                >
                  Choose an installation date
                </a>
                <p
                  style="
                    margin: 14px 0 0;
                    color: #8b949e;
                    font-size: 11px;
                    line-height: 16px;
                  "
                >
                  Next working day installation when you order by 3pm, subject
                  to availability.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background: #eef1f4; padding: 32px 26px">
                <div>
                  <div
                    style="
                      display: inline-block;
                      background-color: #ffde59;
                      padding: 14px 32px;
                      font-size: 20px;
                      letter-spacing: 6px;
                      font-weight: 600;
                      border-radius: 4px;
                      color: #000;
                      font-family:
                        &quot;Helvetica Neue&quot;, Arial, sans-serif;
                    "
                  >
                    YOLO HEAT
                  </div>
                </div>

                <p
                  style="
                    margin: 0;
                    color: #65717d;
                    font-size: 14px;
                    line-height: 16px;
                    margin-top: 24px;
                  "
                >
                  ©${new Date().getFullYear()} Yelo Heat Limited. All rights
                  reserved.
                </p>

                <p
                  style="
                    margin: 14px 0 0;
                    color: #65717d;
                    font-size: 14px;
                    line-height: 16px;
                  "
                >
                  This email contains your quote information. Prices are based
                  on the information provided during your quote journey.
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
