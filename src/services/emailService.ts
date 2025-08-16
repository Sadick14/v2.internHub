
'use server';

import { sendMail } from '@/lib/email';
import type { AppNotification } from './notificationsService';

/**
 * Sends a verification code email.
 * @param to The recipient's email address.
 * @param code The verification code.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const subject = 'Verify Your Intern Hub Account';
  const text = `Your verification code is ${code}. Please use this code to complete your registration.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #4CAF50;">Welcome to InternTrack!</h1>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f0f2f0; padding: 10px 20px; display: inline-block; border-radius: 5px;">${code}</p>
      <p>Please use this code to complete your registration.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}

/**
 * Sends a generic notification email.
 * @param to The recipient's email address.
 * @param notification The notification object containing title, message, and href.
 */
export async function sendGenericNotificationEmail(to: string, notification: Pick<AppNotification, 'title' | 'message' | 'href'>): Promise<void> {
    const { title, message, href } = notification;
    const subject = `Intern Hub: ${title}`;
    const text = `${message}\n\nYou can view this notification in the app: https://internshiptrack-iru7j.web.app${href || '/'}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #4CAF50;">InternTrack Notification</h1>
            <h2 style="color: #2196F3;">${title}</h2>
            <p>${message}</p>
            ${href ? `<p><a href="https://internshiptrack-iru7j.web.app${href}" style="background-color: #2196F3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Details in App</a></p>` : ''}
        </div>
    `;

    await sendMail({ to, subject, text, html });
}
