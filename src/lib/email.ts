
'use server';
import nodemailer from 'nodemailer';

// Re-configured for clarity and robustness
const emailServerHost = process.env.EMAIL_SERVER_HOST;
const emailServerPort = process.env.EMAIL_SERVER_PORT;
const emailServerUser = process.env.EMAIL_SERVER_USER;
const emailServerPassword = process.env.EMAIL_SERVER_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;

// Check if all required environment variables are set
if (!emailServerHost || !emailServerPort || !emailServerUser || !emailServerPassword || !emailFrom) {
    console.warn(`
        [EMAIL SERVICE WARNING]
        Email service is not fully configured. Please provide all required environment variables in your .env file:
        - EMAIL_SERVER_HOST
        - EMAIL_SERVER_PORT
        - EMAIL_SERVER_USER
        - EMAIL_SERVER_PASSWORD
        - EMAIL_FROM
    `);
}

const transporter = nodemailer.createTransport({
  host: emailServerHost,
  port: Number(emailServerPort),
  secure: Number(emailServerPort) === 465, // Use secure connection for port 465
  auth: {
    user: emailServerUser,
    pass: emailServerPassword,
  },
});

interface MailOptions {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
}

export async function sendMail({ to, subject, text, html }: MailOptions) {
  // If email service is not configured, log a warning and do not proceed.
  if (!emailServerHost) {
      console.warn(`[EMAIL] Attempted to send email, but service is not configured. Subject: ${subject}`);
      return;
  }
  
  try {
      await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EMAIL] Successfully sent email to: ${to} | Subject: ${subject}`);
  } catch (error) {
      console.error("[EMAIL] Error sending email:", error);
      // Re-throwing the error can allow the caller to handle it if needed,
      // but for notifications, we might not want to fail the whole operation.
      throw new Error("Failed to send email.");
  }
}
