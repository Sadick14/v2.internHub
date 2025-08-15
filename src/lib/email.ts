
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});


interface MailOptions {
    from?: string;
    to: string | string[];
    subject: string;
    text: string;
    html: string;
}

export async function sendMail({ to, subject, text, html }: MailOptions) {
  const from = `InternshipTrack <${process.env.EMAIL_FROM}>`;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
