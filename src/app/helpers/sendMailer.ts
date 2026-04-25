// import nodemailer from 'nodemailer';
// import config from '../config';

// const sendMailer = async (email: string, subject?: string, html?: string) => {
//   const transporter = nodemailer.createTransport({
//     host: config.email.host,
//     port: Number(config.email.port),
//     secure: false,
//     auth: {
//       user: config.email.address,
//       pass: config.email.pass,
//     },
//   });
//   const info = await transporter.sendMail({
//     from: `"YELO HEAT" ${config.email.from}`,
//     to: email,
//     subject,
//     html,
//   });

//   console.log('Message sent:', info.messageId);
// };

// export default sendMailer;
import nodemailer from 'nodemailer';
import config from '../config';

const sendMailer = async (email: string, subject?: string, html?: string) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host, // smtpout.secureserver.net
    port: Number(config.email.port), // 587
    secure: false,
    auth: {
      user: config.email.address, // hello@yoloheat.com
      pass: config.email.pass, // Azztec1234@&
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: `"YOLO HEAT" <${config.email.from}>`,
    to: email,
    subject,
    html,
  });

  console.log('Message sent:', info.messageId);
};

export default sendMailer;
