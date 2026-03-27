const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@insights.ai';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

async function sendTaskNotification(to, subject, text, html) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[Email] SMTP credentials NOT SET. Logging instead:');
    console.log(`[To: ${to}] [Subject: ${subject}] [Content: ${text}]`);
    return { success: true, logged: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"inSIGHTS AI" <${EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[Email] Notification sent to ${to}: ${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error(`[Email] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendTaskNotification };
