import nodemailer from 'nodemailer';

let transporter = null;

const initTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development fallback using Ethereal test account or console logging
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email] Ethereal test mailer initialized (${testAccount.user})`);
    } catch {
      // In case offline, use dummy logger
      transporter = {
        sendMail: async (options) => {
          console.log(`[Email Mock Log] To: ${options.to} | Subject: ${options.subject}`);
          return { messageId: 'mock-mail-id' };
        },
      };
    }
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailer = await initTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"HackMate" <no-reply@hackmate.dev>',
      to,
      subject,
      text: text || '',
      html: html || '',
    });
    if (nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Preview URL]: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.error(`[Email Error]: ${error.message}`);
    // Don't crash request if email delivery fails in development
    return null;
  }
};
