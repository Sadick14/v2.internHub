
'use server';

import { sendMail } from '@/lib/email';
import type { AppNotification } from './notificationsService';

/**
 * Sends an initial invitation email to a new user.
 * @param to The recipient's email address.
 * @param name The recipient's name.
 */
export async function sendInviteEmail(to: string, name: string): Promise<void> {
  const subject = 'You are invited to join InternHub for HTU';
  const text = `Hello ${name},\n\nYou have been invited to join the InternHub platform for Ho Technical University's internship program. Please visit the link below to verify your email and set up your account.\n\nVerify here: https://internshiptrack-iru7j.web.app/verify`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
      <h1 style="color: #221C4A;">Welcome to InternHub!</h1>
      <p>Hello ${name},</p>
      <p>You have been invited to join the <strong>InternHub</strong> platform, in affiliation with <strong>Ho Technical University (HTU)</strong>, to manage your internship program.</p>
      <p>To get started, please click the link below to verify your email address and create your account.</p>
      <p style="margin: 25px 0;">
        <a href="https://internshiptrack-iru7j.web.app/verify" style="background-color: #221C4A; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Account</a>
      </p>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">You received this email because an administrator or your supervisor invited you to the InternHub platform for HTU.</p>
      <p style="font-size: 12px; color: #888;">&copy; InternHub Team (HTU)</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}


/**
 * Sends a verification code email.
 * @param to The recipient's email address.
 * @param code The verification code.
 */
export async function sendVerificationCodeEmail(to: string, code: string): Promise<void> {
  const subject = 'Your InternHub Verification Code';
  const text = `Your verification code for InternHub (HTU) is ${code}. Please use this code to complete your registration.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #221C4A;">InternHub Account Verification</h1>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f0f2f0; padding: 10px 20px; display: inline-block; border-radius: 5px;">${code}</p>
      <p>Please use this code to complete your registration on the InternHub platform for HTU.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">You received this email because you requested a verification code for the InternHub platform for HTU.</p>
      <p style="font-size: 12px; color: #888;">&copy; InternHub Team (HTU)</p>
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
    const subject = `InternHub Notification: ${title}`;
    const text = `${message}\n\nYou can view this notification in the InternHub app (HTU): https://internshiptrack-iru7j.web.app${href || '/'}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #221C4A;">InternHub Notification (HTU)</h1>
            <h2 style="color: #4A90E2;">${title}</h2>
            <p>${message}</p>
            ${href ? `<p style="margin: 25px 0;"><a href="https://internshiptrack-iru7j.web.app${href}" style="background-color: #4A90E2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details in App</a></p>` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">You are receiving this email because of activity related to your account on the InternHub platform for HTU. You can manage your notification preferences in your account settings.</p>
            <p style="font-size: 12px; color: #888;">&copy; InternHub Team (HTU)</p>
        </div>
    `;

    await sendMail({ to, subject, text, html });
}
