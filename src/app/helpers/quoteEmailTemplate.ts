// export const quoteEmailTemplate = (quote: any): string => {
//   const personal = quote.personalInfo ?? {};
//   const fullName = `${personal.title ?? ''} ${personal.fastName ?? ''} ${personal.sureName ?? ''}`.trim();
//   const product = quote.productId;
//   const controller = quote.controller;
//   const extra = quote.extra;

//   const formatDate = (date?: Date) =>
//     date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';

//   const quizSection =
//     Array.isArray(quote.quizAnswers) && quote.quizAnswers.length
//       ? `
//         <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin-top:8px;">
//           ${quote.quizAnswers
//             .map(
//               (qa: any) => `
//             <tr>
//               <td style="border:1px solid #e2e8f0; background:#f8fafc; width:50%; font-weight:600; color:#374151;">${qa.question}</td>
//               <td style="border:1px solid #e2e8f0; color:#4b5563;">${qa.answer}</td>
//             </tr>`,
//             )
//             .join('')}
//         </table>`
//       : '<p style="color:#6b7280;">No quiz answers provided.</p>';

//   const monthlySection = quote.payMounthly && quote.payMounthlyData
//     ? `
//       <tr>
//         <td style="padding:6px 0; color:#6b7280; font-weight:600;">Deposit</td>
//         <td style="padding:6px 0; color:#111827;">£${quote.payMounthlyData.deposit ?? 'N/A'}</td>
//       </tr>
//       <tr>
//         <td style="padding:6px 0; color:#6b7280; font-weight:600;">Monthly Amount</td>
//         <td style="padding:6px 0; color:#111827;">£${quote.payMounthlyData.amount ?? 'N/A'}</td>
//       </tr>
//       <tr>
//         <td style="padding:6px 0; color:#6b7280; font-weight:600;">Number of Months</td>
//         <td style="padding:6px 0; color:#111827;">${quote.payMounthlyData.mounthNumber ?? 'N/A'}</td>
//       </tr>`
//     : '';

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Your Quote Summary</title>
// </head>
// <body style="margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Arial,sans-serif;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding:40px 0;">
//     <tr>
//       <td align="center">
//         <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

//           <!-- Header -->
//           <tr>
//             <td style="background:linear-gradient(135deg,#1e40af,#3b82f6); padding:36px 40px; text-align:center;">
//               <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.5px;">Your Quote Summary</h1>
//               <p style="margin:8px 0 0; color:#bfdbfe; font-size:14px;">Thank you for choosing us, ${fullName || 'valued customer'}!</p>
//             </td>
//           </tr>

//           <!-- Body -->
//           <tr>
//             <td style="padding:36px 40px;">

//               <!-- Personal Info -->
//               <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Personal Information</h2>
//               <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Full Name</td>
//                   <td style="padding:6px 0; color:#111827;">${fullName || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Email</td>
//                   <td style="padding:6px 0; color:#111827;">${personal.email || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Mobile</td>
//                   <td style="padding:6px 0; color:#111827;">${personal.mobleNumber || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Postcode</td>
//                   <td style="padding:6px 0; color:#111827;">${personal.postcode || 'N/A'}</td>
//                 </tr>
//               </table>

//               <!-- Product -->
//               ${product ? `
//               <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Selected Boiler</h2>
//               <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Product</td>
//                   <td style="padding:6px 0; color:#111827;">${product.title ?? 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Price</td>
//                   <td style="padding:6px 0; color:#111827;">£${product.price ?? 'N/A'}</td>
//                 </tr>
//                 ${product.payablePrice ? `
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Payable Price</td>
//                   <td style="padding:6px 0; color:#16a34a; font-weight:700;">£${product.payablePrice}</td>
//                 </tr>` : ''}
//               </table>` : ''}

//               <!-- Controller -->
//               ${controller ? `
//               <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Controller</h2>
//               <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Controller</td>
//                   <td style="padding:6px 0; color:#111827;">${controller.title ?? 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Price</td>
//                   <td style="padding:6px 0; color:#111827;">£${controller.price ?? 'N/A'}</td>
//                 </tr>
//               </table>` : ''}

//               <!-- Extra -->
//               ${extra ? `
//               <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Extra</h2>
//               <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Extra</td>
//                   <td style="padding:6px 0; color:#111827;">${extra.title ?? 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Price</td>
//                   <td style="padding:6px 0; color:#111827;">£${extra.price ?? 'N/A'}</td>
//                 </tr>
//               </table>` : ''}

//               <!-- Installation Details -->
//               <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Installation Details</h2>
//               <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Survey Date</td>
//                   <td style="padding:6px 0; color:#111827;">${formatDate(quote.surveyDate)}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Install Date</td>
//                   <td style="padding:6px 0; color:#111827;">${formatDate(quote.installDate)}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Install Address</td>
//                   <td style="padding:6px 0; color:#111827;">${quote.installAddress || 'N/A'}</td>
//                 </tr>
//               </table>

//               <!-- Payment -->
//               <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Payment Details</h2>
//               <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600; width:40%;">Pay by Card</td>
//                   <td style="padding:6px 0; color:#111827;">${quote.payByCard ? 'Yes' : 'No'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:6px 0; color:#6b7280; font-weight:600;">Pay Monthly</td>
//                   <td style="padding:6px 0; color:#111827;">${quote.payMounthly ? 'Yes' : 'No'}</td>
//                 </tr>
//                 ${monthlySection}
//               </table>

//               <!-- Quiz Answers -->
//               <h2 style="margin:0 0 16px; font-size:16px; color:#1e40af; border-bottom:2px solid #dbeafe; padding-bottom:8px;">Quiz Answers</h2>
//               ${quizSection}

//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td style="background:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
//               <p style="margin:0; color:#9ca3af; font-size:13px;">This is an automated quote summary. Please do not reply to this email.</p>
//               <p style="margin:8px 0 0; color:#9ca3af; font-size:13px;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
//             </td>
//           </tr>

//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>`;
// };

// export const quoteEmailTemplate = (quote: any): string => {
//   const personal = quote.personalInfo ?? {};
//   const fullName = `${personal.title ?? ''} ${personal.fastName ?? ''} ${personal.sureName ?? ''}`.trim();
//   const product = quote.productId;
//   const controller = quote.controller;
//   const extra = quote.extra;

//   const formatDate = (date?: Date) =>
//     date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';

//   const quizSection =
//     Array.isArray(quote.quizAnswers) && quote.quizAnswers.length
//       ? `
//         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:8px;">
//           ${quote.quizAnswers
//             .map(
//               (qa: any) => `
//             <tr>
//               <td style="padding:10px 14px; border-bottom:1px solid #f0f0f0; background:#fafafa; width:50%; font-size:14px; font-weight:600; color:#333; font-family:Georgia,serif;">${qa.question}</td>
//               <td style="padding:10px 14px; border-bottom:1px solid #f0f0f0; font-size:14px; color:#555; font-family:Georgia,serif;">${qa.answer}</td>
//             </tr>`,
//             )
//             .join('')}
//         </table>`
//       : '<p style="color:#999; font-size:14px; font-family:Georgia,serif;">No quiz answers provided.</p>';

//   const monthlySection = quote.payMounthly && quote.payMounthlyData
//     ? `
//       <tr>
//         <td style="padding:8px 0; font-size:14px; color:#666; font-weight:600; width:45%; font-family:Georgia,serif;">Deposit</td>
//         <td style="padding:8px 0; font-size:14px; color:#222; font-family:Georgia,serif;">£${quote.payMounthlyData.deposit ?? 'N/A'}</td>
//       </tr>
//       <tr>
//         <td style="padding:8px 0; font-size:14px; color:#666; font-weight:600; font-family:Georgia,serif;">Monthly Amount</td>
//         <td style="padding:8px 0; font-size:14px; color:#222; font-family:Georgia,serif;">£${quote.payMounthlyData.amount ?? 'N/A'}</td>
//       </tr>
//       <tr>
//         <td style="padding:8px 0; font-size:14px; color:#666; font-weight:600; font-family:Georgia,serif;">Number of Months</td>
//         <td style="padding:8px 0; font-size:14px; color:#222; font-family:Georgia,serif;">${quote.payMounthlyData.mounthNumber ?? 'N/A'}</td>
//       </tr>`
//     : '';

//   const totalPrice = product?.payablePrice || product?.price;

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Your Fixed Price Quote</title>
// </head>
// <body style="margin:0; padding:0; background:#f4f4f4; font-family:Georgia,'Times New Roman',serif;">

//   <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:30px 0;">
//     <tr>
//       <td align="center">
//         <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:4px; overflow:hidden;">

//           <!-- ===== LOGO HEADER ===== -->
//           <tr>
//             <td style="background:#ffffff; padding:24px 40px; text-align:center; border-bottom:1px solid #eeeeee;">
//               <h1 style="margin:0; font-size:32px; font-weight:900; color:#e63946; letter-spacing:4px; font-family:Arial,sans-serif;">BOXT</h1>
//             </td>
//           </tr>

//           <!-- ===== HERO BANNER ===== -->
//           <tr>
//             <td style="background:#e63946; padding:40px 40px 32px; text-align:center;">
//               <p style="margin:0 0 10px; font-size:13px; color:#ffb3b8; letter-spacing:1px; text-transform:uppercase; font-family:Arial,sans-serif;">Your fixed price quote for a</p>
//               <h2 style="margin:0 0 16px; font-size:24px; font-weight:700; color:#ffffff; line-height:1.3; font-family:Arial,sans-serif;">
//                 ${product?.title || 'Your Selected Boiler'}
//               </h2>
//               <p style="margin:0 0 4px; font-size:13px; color:#ffb3b8; font-family:Arial,sans-serif;">Your fixed price, including installation:</p>

//               <!-- Price Box -->
//               <table cellpadding="0" cellspacing="0" align="center" style="margin:16px auto 0;">
//                 <tr>
//                   <td style="background:#c0392b; border-radius:6px; padding:18px 48px; text-align:center;">
//                     <span style="font-size:40px; font-weight:900; color:#ffffff; letter-spacing:-1px; font-family:Arial,sans-serif;">
//                       £${totalPrice ?? 'N/A'}
//                     </span>
//                   </td>
//                 </tr>
//               </table>

//               <p style="margin:16px 0 0; font-size:13px; color:#ffcdd0; line-height:1.6; font-family:Arial,sans-serif;">
//                 Your tailored quote has been saved, and <strong style="color:#fff;">your price is locked in for 30 days</strong>.<br/>
//                 Your fixed price includes everything needed to get your new boiler up and running, so there's <strong style="color:#fff;">no hidden extra costs</strong>.
//               </p>

//               ${quote.referenceNumber ? `
//               <table cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 0;">
//                 <tr>
//                   <td style="background:rgba(0,0,0,0.15); border-radius:3px; padding:6px 18px;">
//                     <span style="font-size:12px; color:#ffcdd0; letter-spacing:2px; font-family:Arial,sans-serif; text-transform:uppercase;">Reference: ${quote.referenceNumber}</span>
//                   </td>
//                 </tr>
//               </table>` : ''}

//               <!-- CTA Button -->
//               <table cellpadding="0" cellspacing="0" align="center" style="margin:24px auto 0;">
//                 <tr>
//                   <td style="background:#ffffff; border-radius:4px; padding:14px 36px;">
//                     <span style="font-size:15px; font-weight:700; color:#e63946; text-decoration:none; letter-spacing:0.5px; font-family:Arial,sans-serif;">View quote</span>
//                   </td>
//                 </tr>
//               </table>

//               <!-- Trustpilot Row -->
//               <p style="margin:20px 0 0; font-size:12px; color:#ffb3b8; font-family:Arial,sans-serif;">
//                 <strong style="color:#fff;">Excellent</strong> &nbsp;★★★★★&nbsp; based on 56,120 reviews &nbsp;|&nbsp; <strong style="color:#fff;">Trustpilot</strong>
//               </p>
//             </td>
//           </tr>

//           <!-- ===== SECTION TITLE ===== -->
//           <tr>
//             <td style="padding:40px 40px 8px; text-align:center;">
//               <h2 style="margin:0; font-size:22px; font-weight:700; color:#222; font-family:Arial,sans-serif;">The smart way to buy a boiler</h2>
//             </td>
//           </tr>

//           <!-- ===== FEATURES: 2-col rows ===== -->

//           <!-- Row 1 -->
//           <tr>
//             <td style="padding:28px 40px 0;">
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr valign="top">
//                   <!-- Icon cell -->
//                   <td width="80" style="padding-right:20px; text-align:center;">
//                     <div style="width:64px; height:64px; background:#f9f9f9; border:2px solid #eee; border-radius:50%; display:inline-block; line-height:64px; text-align:center;">
//                       <span style="font-size:28px;">📋</span>
//                     </div>
//                   </td>
//                   <!-- Text cell -->
//                   <td>
//                     <p style="margin:0 0 4px; font-size:15px; font-weight:700; color:#e63946; font-family:Arial,sans-serif;">Pre-install suitability survey</p>
//                     <p style="margin:0; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">Our in-house experts will double check that everything you've selected is the perfect fit for your home, and everything you need for your new heating system is in the BOXT.</p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Row 2 -->
//           <tr>
//             <td style="padding:24px 40px 0;">
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr valign="top">
//                   <td>
//                     <p style="margin:0 0 4px; font-size:15px; font-weight:700; color:#e63946; font-family:Arial,sans-serif;">Post-install quality check</p>
//                     <p style="margin:0; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">After your new boiler's been installed, our team of Gas Safe engineers double check all the work done meets our high standards, as well as manufacturer regulations.</p>
//                   </td>
//                   <td width="80" style="padding-left:20px; text-align:center;">
//                     <div style="width:64px; height:64px; background:#f9f9f9; border:2px solid #eee; border-radius:50%; display:inline-block; line-height:64px; text-align:center;">
//                       <span style="font-size:28px;">✅</span>
//                     </div>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Row 3 -->
//           <tr>
//             <td style="padding:24px 40px 0;">
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr valign="top">
//                   <td width="80" style="padding-right:20px; text-align:center;">
//                     <div style="width:64px; height:64px; background:#f9f9f9; border:2px solid #eee; border-radius:50%; display:inline-block; line-height:64px; text-align:center;">
//                       <span style="font-size:28px;">👷</span>
//                     </div>
//                   </td>
//                   <td>
//                     <p style="margin:0 0 4px; font-size:15px; font-weight:700; color:#e63946; font-family:Arial,sans-serif;">Qualified and checked local installers</p>
//                     <p style="margin:0; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">To become BOXT accredited, all local installers go through a comprehensive 25-check vetting process, including requiring up to date qualification certificates and DBS checks.</p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Row 4 -->
//           <tr>
//             <td style="padding:24px 40px 0;">
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr valign="top">
//                   <td>
//                     <p style="margin:0 0 4px; font-size:15px; font-weight:700; color:#e63946; font-family:Arial,sans-serif;">Here to help through installation, and beyond</p>
//                     <p style="margin:0; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">After your new boiler's been installed and signed off by our experts, we're still here to help via our app. Plus, for added peace of mind, you get a one year workmanship guarantee on top of the manufacturer warranty.</p>
//                   </td>
//                   <td width="80" style="padding-left:20px; text-align:center;">
//                     <div style="width:64px; height:64px; background:#f9f9f9; border:2px solid #eee; border-radius:50%; display:inline-block; line-height:64px; text-align:center;">
//                       <span style="font-size:28px;">🏅</span>
//                     </div>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Row 5 -->
//           <tr>
//             <td style="padding:24px 40px 0;">
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr valign="top">
//                   <td width="80" style="padding-right:20px; text-align:center;">
//                     <div style="width:64px; height:64px; background:#f9f9f9; border:2px solid #eee; border-radius:50%; display:inline-block; line-height:64px; text-align:center;">
//                       <span style="font-size:28px;">💳</span>
//                     </div>
//                   </td>
//                   <td>
//                     <p style="margin:0 0 4px; font-size:15px; font-weight:700; color:#e63946; font-family:Arial,sans-serif;">Flexible payment options</p>
//                     <p style="margin:0; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">With a range of ways to pay, rest assured you won't get a better price anywhere else, and you can pay using whichever method you prefer.</p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Row 6 -->
//           <tr>
//             <td style="padding:24px 40px 32px;">
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr valign="top">
//                   <td>
//                     <p style="margin:0 0 4px; font-size:15px; font-weight:700; color:#e63946; font-family:Arial,sans-serif;">Next working day installation</p>
//                     <p style="margin:0; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">When your boiler's not working properly, we know you want heating and hot water back as soon as possible, which is why we offer next working day installation when you order by 3pm.</p>
//                   </td>
//                   <td width="80" style="padding-left:20px; text-align:center;">
//                     <div style="width:64px; height:64px; background:#f9f9f9; border:2px solid #eee; border-radius:50%; display:inline-block; line-height:64px; text-align:center;">
//                       <span style="font-size:28px;">📅</span>
//                     </div>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Second CTA -->
//           <tr>
//             <td style="padding:0 40px 40px; text-align:center;">
//               <table cellpadding="0" cellspacing="0" align="center">
//                 <tr>
//                   <td style="background:#e63946; border-radius:4px; padding:14px 36px;">
//                     <span style="font-size:15px; font-weight:700; color:#ffffff; font-family:Arial,sans-serif;">View your quote</span>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- ===== WE'RE HERE TO HELP ===== -->
//           <tr>
//             <td style="background:#fafafa; border-top:1px solid #eee; padding:36px 40px;">
//               <h2 style="margin:0 0 6px; font-size:20px; font-weight:700; color:#222; font-family:Arial,sans-serif;">We're here to help</h2>
//               <p style="margin:0 0 20px; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">
//                 We know a new boiler is a big investment and you want to make sure you're choosing the right one for your home, which is why we've fixed your price for 30 days while you decide.
//               </p>
//               <p style="margin:0 0 20px; font-size:13px; color:#555; line-height:1.6; font-family:Arial,sans-serif;">
//                 In the meantime, we're on hand to help answer any questions you might have about your recommended boiler and why it's right for you.
//               </p>

//               <!-- Help Row 1 -->
//               <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
//                 <tr valign="middle">
//                   <td>
//                     <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#222; font-family:Arial,sans-serif;">Submit photos of your existing heating system</p>
//                     <p style="margin:0; font-size:13px; color:#555; font-family:Arial,sans-serif;">for our experts to check your new boiler is suitable, before you buy.</p>
//                   </td>
//                   <td width="140" style="padding-left:16px; text-align:right;">
//                     <table cellpadding="0" cellspacing="0">
//                       <tr>
//                         <td style="background:#e63946; border-radius:4px; padding:10px 18px; white-space:nowrap;">
//                           <span style="font-size:12px; font-weight:700; color:#fff; font-family:Arial,sans-serif;">Submit photo survey</span>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//               </table>

//               <!-- Help Row 2 -->
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr valign="middle">
//                   <td>
//                     <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#222; font-family:Arial,sans-serif;">Get a callback from one of our boiler experts</p>
//                     <p style="margin:0; font-size:13px; color:#555; font-family:Arial,sans-serif;">who will talk you through everything in your fixed price quote.</p>
//                   </td>
//                   <td width="140" style="padding-left:16px; text-align:right;">
//                     <table cellpadding="0" cellspacing="0">
//                       <tr>
//                         <td style="border:2px solid #e63946; border-radius:4px; padding:10px 18px; white-space:nowrap;">
//                           <span style="font-size:12px; font-weight:700; color:#e63946; font-family:Arial,sans-serif;">Request a callback</span>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- ===== QUOTE DETAILS ===== -->
//           <tr>
//             <td style="padding:36px 40px 0;">
//               <h2 style="margin:0 0 20px; font-size:18px; font-weight:700; color:#222; border-bottom:2px solid #e63946; padding-bottom:10px; font-family:Arial,sans-serif;">Your Quote Details</h2>
//             </td>
//           </tr>

//           <!-- Personal Info -->
//           <tr>
//             <td style="padding:0 40px 24px;">
//               <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#e63946; text-transform:uppercase; letter-spacing:1px; font-family:Arial,sans-serif;">Personal Information</p>
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; width:40%; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Full Name</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${fullName || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Email</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${personal.email || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Mobile</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${personal.mobleNumber || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; font-family:Arial,sans-serif;">Postcode</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; font-family:Arial,sans-serif;">${personal.postcode || 'N/A'}</td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Product -->
//           ${product ? `
//           <tr>
//             <td style="padding:0 40px 24px;">
//               <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#e63946; text-transform:uppercase; letter-spacing:1px; font-family:Arial,sans-serif;">Selected Boiler</p>
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; width:40%; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Product</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${product.title ?? 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Price</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">£${product.price ?? 'N/A'}</td>
//                 </tr>
//                 ${product.payablePrice ? `
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; font-family:Arial,sans-serif;">Payable Price</td>
//                   <td style="padding:7px 0; font-size:14px; color:#e63946; font-weight:700; font-family:Arial,sans-serif;">£${product.payablePrice}</td>
//                 </tr>` : ''}
//               </table>
//             </td>
//           </tr>` : ''}

//           <!-- Controller -->
//           ${controller ? `
//           <tr>
//             <td style="padding:0 40px 24px;">
//               <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#e63946; text-transform:uppercase; letter-spacing:1px; font-family:Arial,sans-serif;">Controller</p>
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; width:40%; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Controller</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${controller.title ?? 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; font-family:Arial,sans-serif;">Price</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; font-family:Arial,sans-serif;">£${controller.price ?? 'N/A'}</td>
//                 </tr>
//               </table>
//             </td>
//           </tr>` : ''}

//           <!-- Extra -->
//           ${extra ? `
//           <tr>
//             <td style="padding:0 40px 24px;">
//               <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#e63946; text-transform:uppercase; letter-spacing:1px; font-family:Arial,sans-serif;">Extra</p>
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; width:40%; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Extra</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${extra.title ?? 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; font-family:Arial,sans-serif;">Price</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; font-family:Arial,sans-serif;">£${extra.price ?? 'N/A'}</td>
//                 </tr>
//               </table>
//             </td>
//           </tr>` : ''}

//           <!-- Installation Details -->
//           <tr>
//             <td style="padding:0 40px 24px;">
//               <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#e63946; text-transform:uppercase; letter-spacing:1px; font-family:Arial,sans-serif;">Installation Details</p>
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; width:40%; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Survey Date</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${formatDate(quote.surveyDate)}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Install Date</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${formatDate(quote.installDate)}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; font-family:Arial,sans-serif;">Install Address</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; font-family:Arial,sans-serif;">${quote.installAddress || 'N/A'}</td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Payment Details -->
//           <tr>
//             <td style="padding:0 40px 24px;">
//               <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#e63946; text-transform:uppercase; letter-spacing:1px; font-family:Arial,sans-serif;">Payment Details</p>
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; width:40%; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Pay by Card</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${quote.payByCard ? 'Yes' : 'No'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:7px 0; font-size:13px; color:#666; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">Pay Monthly</td>
//                   <td style="padding:7px 0; font-size:13px; color:#222; border-bottom:1px solid #f5f5f5; font-family:Arial,sans-serif;">${quote.payMounthly ? 'Yes' : 'No'}</td>
//                 </tr>
//                 ${monthlySection}
//               </table>
//             </td>
//           </tr>

//           <!-- Quiz Answers -->
//           <tr>
//             <td style="padding:0 40px 36px;">
//               <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#e63946; text-transform:uppercase; letter-spacing:1px; font-family:Arial,sans-serif;">Quiz Answers</p>
//               ${quizSection}
//             </td>
//           </tr>

//           <!-- ===== TRUST FOOTER BANNER ===== -->
//           <tr>
//             <td style="background:#222; padding:28px 40px; text-align:center;">
//               <p style="margin:0 0 8px; font-size:13px; color:#aaa; line-height:1.6; font-family:Arial,sans-serif;">
//                 Just so you know, every <strong style="color:#fff;">single BOXT order is reviewed</strong> before and after installation by our in-house audit team, who are all Gas Safe registered and have <strong style="color:#fff;">over 60 years of boiler installation experience</strong> between them.
//               </p>
//               <table cellpadding="0" cellspacing="0" align="center" style="margin-top:18px;">
//                 <tr>
//                   <td style="background:#e63946; border-radius:4px; padding:12px 30px;">
//                     <span style="font-size:14px; font-weight:700; color:#fff; font-family:Arial,sans-serif;">Choose an installation date</span>
//                   </td>
//                 </tr>
//               </table>
//               <p style="margin:14px 0 0; font-size:11px; color:#666; font-family:Arial,sans-serif;">*Next working day installation when you order by 3pm, subject to availability.</p>
//             </td>
//           </tr>

//           <!-- ===== LOGO FOOTER ===== -->
//           <tr>
//             <td style="background:#ffffff; padding:28px 40px; text-align:center; border-top:1px solid #eee;">
//               <h2 style="margin:0 0 12px; font-size:26px; font-weight:900; color:#e63946; letter-spacing:4px; font-family:Arial,sans-serif;">BOXT</h2>

//               <!-- Social Icons -->
//               <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom:16px;">
//                 <tr>
//                   <td style="padding:0 5px;"><span style="font-size:18px;">📘</span></td>
//                   <td style="padding:0 5px;"><span style="font-size:18px;">🐦</span></td>
//                   <td style="padding:0 5px;"><span style="font-size:18px;">📸</span></td>
//                   <td style="padding:0 5px;"><span style="font-size:18px;">💼</span></td>
//                   <td style="padding:0 5px;"><span style="font-size:18px;">▶️</span></td>
//                 </tr>
//               </table>

//               <p style="margin:0 0 8px; font-size:11px; color:#888; line-height:1.6; font-family:Arial,sans-serif;">
//                 © ${new Date().getFullYear()} BOXT Limited. All rights reserved.
//               </p>
//               <p style="margin:0 0 8px; font-size:10px; color:#aaa; line-height:1.6; font-family:Arial,sans-serif;">
//                 BOXT Limited is authorised and regulated by the Financial Conduct Authority. FCA register No. 787248.
//               </p>
//               <p style="margin:16px 0 0; font-size:11px; font-family:Arial,sans-serif;">
//                 <a href="#" style="color:#e63946; text-decoration:none; margin:0 8px;">Cookies Policy</a>
//                 <a href="#" style="color:#e63946; text-decoration:none; margin:0 8px;">Privacy Policy</a>
//                 <a href="#" style="color:#e63946; text-decoration:none; margin:0 8px;">Terms and Conditions</a>
//                 <a href="#" style="color:#e63946; text-decoration:none; margin:0 8px;">Unsubscribe</a>
//               </p>
//             </td>
//           </tr>

//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>`;
// };

// export const quoteEmailTemplate = (quote: any): string => {
//   const personal = quote.personalInfo ?? {};
//   const product = quote.productId ?? {};
//   const controller = quote.controller ?? {};
//   const extra = quote.extra ?? {};

//   const fullName =
//     `${personal.title ?? ''} ${personal.fastName ?? ''} ${personal.sureName ?? ''}`.trim();

//   const money = (value?: number) =>
//     typeof value === 'number' ? `£${value.toLocaleString('en-GB')}` : 'N/A';

//   const formatDate = (date?: Date | string) =>
//     date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';

//   const boilerPrice = product.payablePrice ?? product.price ?? 0;
//   const controllerPrice = controller.price ?? 0;
//   const extraPrice = extra.price ?? 0;

//   const subtotal = boilerPrice + controllerPrice + extraPrice;

//   // Future dynamic coupon support
//   const coupon = quote.coupon ?? null;
//   const couponDiscount =
//     coupon?.type === 'percentage'
//       ? Math.round((subtotal * coupon.value) / 100)
//       : (coupon?.value ?? 0);

//   const finalTotal = Math.max(subtotal - couponDiscount, 0);

//   const quoteReference = quote.referenceNo ?? quote._id ?? 'N/A';

//   const quizRows =
//     Array.isArray(quote.quizAnswers) && quote.quizAnswers.length
//       ? quote.quizAnswers
//           .map(
//             (qa: any) => `
//               <tr>
//                 <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;font-weight:bold;">
//                   ${qa.question ?? 'Question'}
//                 </td>
//                 <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#43505c;text-align:right;">
//                   ${qa.answer ?? 'N/A'}
//                 </td>
//               </tr>
//             `,
//           )
//           .join('')
//       : `
//         <tr>
//           <td style="padding:10px 0;font-size:13px;color:#777777;">No quiz answers provided.</td>
//         </tr>
//       `;

//   const couponSection = coupon
//     ? `
//       <tr>
//         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Coupon</td>
//         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">
//           ${coupon.code ?? 'Applied'} - ${money(couponDiscount)}
//         </td>
//       </tr>
//     `
//     : '';

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <title>Your boiler quote</title>

//   <style>
//     @media only screen and (max-width: 640px) {
//       .email-container {
//         width: 100% !important;
//       }

//       .content {
//         padding-left: 18px !important;
//         padding-right: 18px !important;
//       }

//       .hero-title {
//         font-size: 22px !important;
//         line-height: 30px !important;
//       }

//       .two-col,
//       .two-col td {
//         display: block !important;
//         width: 100% !important;
//         text-align: left !important;
//       }

//       .icon-box {
//         margin-bottom: 16px !important;
//       }

//       .mobile-center {
//         text-align: center !important;
//       }

//       .button {
//         display: block !important;
//         width: 100% !important;
//         box-sizing: border-box !important;
//       }
//     }
//   </style>
// </head>

// <body style="margin:0;padding:0;background:#eef1f4;font-family:Arial,Helvetica,sans-serif;color:#344150;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f4;padding:28px 0;">
//     <tr>
//       <td align="center">

//         <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="width:540px;background:#ffffff;">

//           <!-- Logo -->
//           <tr>
//             <td align="center" style="padding:26px 20px 14px;">
//               <div style="font-size:26px;letter-spacing:8px;color:#ff5b57;font-weight:bold;">
//                 BOXT
//               </div>
//             </td>
//           </tr>

//           <!-- Red Hero -->
//           <tr>
//             <td class="content" style="padding:0 26px;">
//               <table width="100%" cellpadding="0" cellspacing="0" style="background:#ff5b57;">
//                 <tr>
//                   <td align="center" style="padding:34px 26px 28px;">
//                     <h1 class="hero-title" style="margin:0;color:#ffffff;font-size:28px;line-height:36px;font-weight:bold;">
//                       Your fixed price quote for a<br/>
//                       ${product.title ?? 'new boiler'} has<br/>
//                       been saved
//                     </h1>

//                     <p style="margin:28px 0 8px;color:#ffffff;font-size:12px;">
//                       Your fixed price, including installation:
//                     </p>

//                     <div style="font-size:28px;font-weight:bold;color:#ffffff;">
//                       ${money(finalTotal)}
//                     </div>

//                     <p style="margin:16px 0 0;color:#ffffff;font-size:12px;line-height:18px;">
//                       Your tailored quote has been saved, and your price is locked in for 30 days.
//                       Your fixed price includes everything needed to get your new boiler up and running,
//                       so there are no hidden extra costs.
//                     </p>
//                   </td>
//                 </tr>
//               </table>

//               <table width="100%" cellpadding="0" cellspacing="0" style="background:#344150;">
//                 <tr>
//                   <td style="padding:8px 12px;color:#ffffff;font-size:10px;font-weight:bold;">
//                     REFERENCE QUOTE: ${quoteReference}
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- CTA -->
//           <tr>
//             <td align="center" style="padding:20px 20px 8px;">
//               <a href="${quote.viewQuoteUrl ?? '#'}" class="button" style="background:#00a878;color:#ffffff;text-decoration:none;font-size:12px;font-weight:bold;padding:10px 22px;display:inline-block;">
//                 View quote
//               </a>
//             </td>
//           </tr>

//           <!-- Rating -->
//           <tr>
//             <td align="center" style="padding:4px 20px 22px;font-size:12px;color:#344150;">
//               Excellent &nbsp;
//               <span style="background:#00b67a;color:#ffffff;padding:3px 6px;">★ ★ ★ ★ ★</span>
//               &nbsp; based on 58,120 reviews &nbsp;
//               <strong style="color:#00b67a;">★ Trustpilot</strong>
//             </td>
//           </tr>

//           <!-- Smart way title -->
//           <tr>
//             <td align="center" class="content" style="padding:0 26px 18px;border-top:1px solid #dddddd;">
//               <h2 style="margin:22px 0 0;color:#344150;font-size:25px;line-height:32px;">
//                 The smart way to buy a boiler
//               </h2>
//             </td>
//           </tr>

//           <!-- Feature 1 -->
//           <tr>
//             <td class="content" style="padding:0 26px 22px;">
//               <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td width="50%" align="center" class="icon-box" style="background:#f4f4f4;padding:32px 15px;">
//                     <div style="font-size:58px;color:#ff5b57;">☑</div>
//                   </td>
//                   <td width="50%" style="padding:20px 0 20px 24px;">
//                     <h3 style="margin:0 0 8px;color:#ff5b57;font-size:19px;line-height:22px;">
//                       Pre-install suitability survey
//                     </h3>
//                     <p style="margin:0;color:#4d5964;font-size:13px;line-height:19px;">
//                       Our in-house experts will double check that everything you have selected is
//                       perfect for your home, and everything you need for your new heating system is in the box.
//                     </p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Feature 2 -->
//           <tr>
//             <td class="content" style="padding:0 26px 22px;">
//               <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td width="50%" style="padding:20px 24px 20px 0;">
//                     <h3 style="margin:0 0 8px;color:#ff5b57;font-size:19px;line-height:22px;">
//                       Post-install quality check
//                     </h3>
//                     <p style="margin:0;color:#4d5964;font-size:13px;line-height:19px;">
//                       After your new boiler has been installed, our quality team checks the work
//                       to make sure it meets our high standards.
//                     </p>
//                   </td>
//                   <td width="50%" align="center" class="icon-box" style="background:#f4f4f4;padding:32px 15px;">
//                     <div style="font-size:58px;color:#344150;">✎</div>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Feature 3 -->
//           <tr>
//             <td class="content" style="padding:0 26px 22px;">
//               <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td width="50%" align="center" class="icon-box" style="background:#f4f4f4;padding:32px 15px;">
//                     <div style="font-size:58px;color:#ff5b57;">👷</div>
//                   </td>
//                   <td width="50%" style="padding:20px 0 20px 24px;">
//                     <h3 style="margin:0 0 8px;color:#ff5b57;font-size:19px;line-height:22px;">
//                       Qualified and checked local installers
//                     </h3>
//                     <p style="margin:0;color:#4d5964;font-size:13px;line-height:19px;">
//                       We work with accredited local installers through a comprehensive checking process.
//                     </p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Feature 4 -->
//           <tr>
//             <td class="content" style="padding:0 26px 22px;">
//               <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td width="50%" style="padding:20px 24px 20px 0;">
//                     <h3 style="margin:0 0 8px;color:#ff5b57;font-size:19px;line-height:22px;">
//                       Here to help through installation, and beyond
//                     </h3>
//                     <p style="margin:0;color:#4d5964;font-size:13px;line-height:19px;">
//                       After your boiler is installed, our experts are still here to help you with
//                       questions and warranty support.
//                     </p>
//                   </td>
//                   <td width="50%" align="center" class="icon-box" style="background:#f4f4f4;padding:32px 15px;">
//                     <div style="font-size:58px;color:#ff5b57;">🏅</div>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Feature 5 -->
//           <tr>
//             <td class="content" style="padding:0 26px 22px;">
//               <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td width="50%" align="center" class="icon-box" style="background:#f4f4f4;padding:32px 15px;">
//                     <div style="font-size:58px;color:#ff5b57;">💷</div>
//                   </td>
//                   <td width="50%" style="padding:20px 0 20px 24px;">
//                     <h3 style="margin:0 0 8px;color:#ff5b57;font-size:19px;line-height:22px;">
//                       Flexible payment options
//                     </h3>
//                     <p style="margin:0;color:#4d5964;font-size:13px;line-height:19px;">
//                       Pay by card or choose monthly payment options, depending on your selected plan.
//                     </p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Feature 6 -->
//           <tr>
//             <td class="content" style="padding:0 26px 24px;">
//               <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td width="50%" style="padding:20px 24px 20px 0;">
//                     <h3 style="margin:0 0 8px;color:#ff5b57;font-size:19px;line-height:22px;">
//                       Next working day installation
//                     </h3>
//                     <p style="margin:0;color:#4d5964;font-size:13px;line-height:19px;">
//                       When your boiler is not working properly, we know you need heating and hot water fast.
//                     </p>
//                   </td>
//                   <td width="50%" align="center" class="icon-box" style="background:#f4f4f4;padding:32px 15px;">
//                     <div style="font-size:58px;color:#ff5b57;">📅</div>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Quote Details -->
//           <tr>
//             <td class="content" style="padding:0 26px 26px;">
//               <table width="100%" cellpadding="0" cellspacing="0" style="background:#ff5b57;">
//                 <tr>
//                   <td style="padding:22px 24px;">
//                     <h2 style="margin:0 0 14px;color:#ffffff;font-size:22px;text-align:center;">
//                       Your quote details
//                     </h2>

//                     <table width="100%" cellpadding="0" cellspacing="0">
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Customer</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${fullName || 'N/A'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Email</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${personal.email ?? 'N/A'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Mobile</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${personal.mobleNumber ?? 'N/A'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Postcode</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${personal.postcode ?? 'N/A'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Boiler</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${product.title ?? 'N/A'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Controller</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${controller.title ?? 'N/A'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Extra</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${extra.title ?? 'N/A'}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;">Subtotal</td>
//                         <td style="padding:7px 0;color:#ffffff;font-size:13px;text-align:right;">${money(subtotal)}</td>
//                       </tr>

//                       ${couponSection}

//                       <tr>
//                         <td style="padding:12px 0 0;color:#ffffff;font-size:18px;font-weight:bold;border-top:1px solid rgba(255,255,255,.45);">
//                           Total
//                         </td>
//                         <td style="padding:12px 0 0;color:#ffffff;font-size:22px;font-weight:bold;text-align:right;border-top:1px solid rgba(255,255,255,.45);">
//                           ${money(finalTotal)}
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Dates -->
//           <tr>
//             <td class="content" style="padding:0 26px 26px;">
//               <h2 style="margin:0 0 14px;color:#344150;font-size:24px;text-align:center;">
//                 Installation information
//               </h2>

//               <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
//                 <tr>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;font-weight:bold;">Survey date</td>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;text-align:right;">${formatDate(quote.surveyDate)}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;font-weight:bold;">Install date</td>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;text-align:right;">${formatDate(quote.installDate)}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;font-weight:bold;">Install address</td>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;text-align:right;">${quote.installAddress ?? 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;font-weight:bold;">Payment method</td>
//                   <td style="padding:10px 0;font-size:13px;color:#43505c;text-align:right;">
//                     ${quote.payMounthly ? 'Monthly payment' : quote.payByCard ? 'Card payment' : 'N/A'}
//                   </td>
//                 </tr>
//                 ${
//                   quote.payMounthly && quote.payMounthlyData
//                     ? `
//                     <tr>
//                       <td style="padding:10px 0;font-size:13px;color:#43505c;font-weight:bold;">Monthly plan</td>
//                       <td style="padding:10px 0;font-size:13px;color:#43505c;text-align:right;">
//                         Deposit ${money(quote.payMounthlyData.deposit)},
//                         ${money(quote.payMounthlyData.amount)} x ${quote.payMounthlyData.mounthNumber} months
//                       </td>
//                     </tr>
//                     `
//                     : ''
//                 }
//               </table>
//             </td>
//           </tr>

//           <!-- Quiz -->
//           <tr>
//             <td class="content" style="padding:0 26px 28px;">
//               <h2 style="margin:0 0 14px;color:#344150;font-size:24px;text-align:center;">
//                 Your survey answers
//               </h2>

//               <table width="100%" cellpadding="0" cellspacing="0">
//                 ${quizRows}
//               </table>
//             </td>
//           </tr>

//           <!-- Help -->
//           <tr>
//             <td class="content" style="padding:0 26px 26px;">
//               <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #dddddd;padding-top:22px;">
//                 <tr>
//                   <td align="center">
//                     <h2 style="margin:0;color:#344150;font-size:25px;">We're here to help</h2>
//                     <p style="margin:14px 0 22px;color:#4d5964;font-size:13px;line-height:20px;">
//                       We know a new boiler is a big investment. Your quote is saved for 30 days,
//                       and our team can help you choose the right option.
//                     </p>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td>
//                     <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
//                       <tr>
//                         <td width="55%" style="font-size:13px;color:#344150;line-height:18px;">
//                           <strong>Submit photos of your existing heating system</strong><br/>
//                           Our experts can check your boiler before you buy.
//                         </td>
//                         <td width="45%" align="right" class="mobile-center" style="padding:10px 0;">
//                           <a href="${quote.photoSurveyUrl ?? '#'}" class="button" style="border:2px solid #00a878;color:#00a878;text-decoration:none;font-size:12px;font-weight:bold;padding:9px 16px;display:inline-block;">
//                             Submit photo survey
//                           </a>
//                         </td>
//                       </tr>

//                       <tr>
//                         <td width="55%" style="font-size:13px;color:#344150;line-height:18px;padding-top:16px;">
//                           <strong>Get a callback from one of our boiler experts</strong><br/>
//                           We can talk you through everything in your quote.
//                         </td>
//                         <td width="45%" align="right" class="mobile-center" style="padding:16px 0 0;">
//                           <a href="${quote.callbackUrl ?? '#'}" class="button" style="border:2px solid #00a878;color:#00a878;text-decoration:none;font-size:12px;font-weight:bold;padding:9px 16px;display:inline-block;">
//                             Request a callback
//                           </a>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Final CTA -->
//           <tr>
//             <td align="center" class="content" style="padding:0 26px 30px;">
//               <a href="${quote.installationDateUrl ?? '#'}" class="button" style="background:#00a878;color:#ffffff;text-decoration:none;font-size:12px;font-weight:bold;padding:11px 24px;display:inline-block;">
//                 Choose an installation date
//               </a>
//               <p style="margin:14px 0 0;color:#8b949e;font-size:11px;line-height:16px;">
//                 Next working day installation when you order by 3pm, subject to availability.
//               </p>
//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td style="background:#eef1f4;padding:32px 26px;">
//               <div style="font-size:26px;letter-spacing:8px;color:#ff5b57;font-weight:bold;margin-bottom:26px;">
//                 BOXT
//               </div>

//               <p style="margin:0;color:#65717d;font-size:10px;line-height:16px;">
//                 ©${new Date().getFullYear()} BOXT Limited. All rights reserved.
//               </p>

//               <p style="margin:14px 0 0;color:#65717d;font-size:10px;line-height:16px;">
//                 This email contains your quote information. Prices are based on the information
//                 provided during your quote journey.
//               </p>

//               <p style="margin:18px 0 0;color:#ff5b57;font-size:10px;">
//                 Cookies Policy | Privacy Policy | Terms and Conditions | Unsubscribe
//               </p>
//             </td>
//           </tr>

//         </table>

//       </td>
//     </tr>
//   </table>
// </body>
// </html>
// `;
// };

export const quoteEmailTemplate = (
  quote: any,
  price?: number,
  url?: string,
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

    // Email links should be absolute URLs to avoid broken redirects in mail clients.
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

  const resolvedViewQuoteUrl =
    normalizeExternalUrl(url) || normalizeExternalUrl(quote.viewQuoteUrl) || '#';
  const viewQuoteUrl =
    resolvedViewQuoteUrl === '#'
      ? resolvedViewQuoteUrl
      : escapeHtmlAttribute(resolvedViewQuoteUrl);
  const quoteReference = quote.referenceNo ?? quote._id ?? 'N/A';

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
                        object-fit="cover"
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
                        alt="Pre-install suitability survey"
                        width="100"
                        height="100"
                        object-fit="cover"
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
                        alt="Pre-install suitability survey"
                        width="100"
                        height="100"
                        object-fit="cover"
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
                        After your new boiler’s been installed and signed off by
                        our experts, we're still here to help via our app. Plus,
                        for added peace of mind, you get a one year workmanship
                        guarantee on top of the manufacturer warranty.
                      </p>
                    </td>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_1_ccu1gb.jpg"
                        alt="Pre-install suitability survey"
                        width="100"
                        height="100"
                        object-fit="cover"
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
                        alt="Pre-install suitability survey"
                        width="100"
                        height="100"
                        object-fit="cover"
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
                        promise, rest assured you won’t get a better price
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
                        When your boiler’s not working properly, we know you
                        want heating and hot water back as soon as possible,
                        which is why we offer next working day installation when
                        you order by 3pm*.
                      </p>
                    </td>
                    <td width="50%" align="center" class="icon-box">
                      <img
                        src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093426/WhatsApp_Image_2026-04-25_at_11.02.18_AM_3_o8bjnx.jpg"
                        alt="Pre-install suitability survey"
                        width="100"
                        height="100"
                        object-fit="cover"
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
                  style="background:#00A56F "
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
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Customer
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
                            ${fullName || 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Email
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
                            ${personal.email ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Mobile
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
                            ${personal.mobleNumber ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Postcode
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
                            ${personal.postcode ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Boiler
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
                            ${product.title ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Controller
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
                            ${controller.title ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Extra
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
                            ${extra.title ?? 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                            "
                          >
                            Subtotal
                          </td>
                          <td
                            style="
                              padding: 7px 0;
                              color: #ffffff;
                              font-size: 13px;
                              text-align: right;
                            "
                          >
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
                    <td
                      style="
                        padding: 10px 0;
                        font-size: 13px;
                        color: #43505c;
                        font-weight: bold;
                      "
                    >
                      Survey date
                    </td>
                    <td
                      style="
                        padding: 10px 0;
                        font-size: 13px;
                        color: #43505c;
                        text-align: right;
                      "
                    >
                      ${formatDate(quote.surveyDate)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="
                        padding: 10px 0;
                        font-size: 13px;
                        color: #43505c;
                        font-weight: bold;
                      "
                    >
                      Install date
                    </td>
                    <td
                      style="
                        padding: 10px 0;
                        font-size: 13px;
                        color: #43505c;
                        text-align: right;
                      "
                    >
                      ${formatDate(quote.installDate)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="
                        padding: 10px 0;
                        font-size: 13px;
                        color: #43505c;
                        font-weight: bold;
                      "
                    >
                      Install address
                    </td>
                    <td
                      style="
                        padding: 10px 0;
                        font-size: 13px;
                        color: #43505c;
                        text-align: right;
                      "
                    >
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
                        <img src="https://res.cloudinary.com/dsk5rdtcv/image/upload/v1777093514/WhatsApp_Image_2026-04-25_at_11.04.44_AM_dgmkoh.jpg" alt="">
                      </div>
                      
                      <p>
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
