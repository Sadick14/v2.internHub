
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
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="background-color: #221C4A; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">InternHub (HTU)</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333333; font-size: 20px;">You're Invited!</h2>
          <p style="color: #555555; line-height: 1.6;">Hello ${name},</p>
          <p style="color: #555555; line-height: 1.6;">You have been invited to join the <strong>InternHub</strong> platform, in affiliation with <strong>Ho Technical University (HTU)</strong>, to manage your internship program.</p>
          <p style="color: #555555; line-height: 1.6;">To get started, please click the button below to verify your email address and create your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://internshiptrack-iru7j.web.app/verify" style="background-color: #221C4A; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Your Account</a>
          </div>
          <p style="color: #555555; line-height: 1.6;">If you did not expect this invitation, you can safely ignore this email.</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="font-size: 12px; color: #888888; margin: 0;">You received this email because an administrator or your supervisor invited you to the InternHub platform for HTU.</p>
          <p style="font-size: 12px; color: #888888; margin: 5px 0 0 0;">&copy; InternHub Team (HTU)</p>
        </div>
      </div>
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
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="background-color: #221C4A; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">InternHub (HTU)</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333333; font-size: 20px;">Your Verification Code</h2>
          <p style="color: #555555; line-height: 1.6;">Please use the following code to complete your account setup on the InternHub platform for HTU.</p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; background-color: #f0f2f0; padding: 15px 25px; display: inline-block; border-radius: 5px; color: #333;">${code}</p>
          </div>
          <p style="color: #555555; line-height: 1.6;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="font-size: 12px; color: #888888; margin: 0;">You received this email because you requested a verification code for the InternHub platform for HTU.</p>
          <p style="font-size: 12px; color: #888888; margin: 5px 0 0 0;">&copy; InternHub Team (HTU)</p>
        </div>
      </div>
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
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="background-color: #4A90E2; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">InternHub Notification (HTU)</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px;">${title}</h2>
            <p style="color: #555555; line-height: 1.6;">${message}</p>
            ${href ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://internshiptrack-iru7j.web.app${href}" style="background-color: #4A90E2; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Details in App</a>
              </div>
            ` : ''}
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="font-size: 12px; color: #888888; margin: 0;">You are receiving this email because of activity related to your account on the InternHub platform for HTU. You can manage your notification preferences in your account settings.</p>
            <p style="font-size: 12px; color: #888888; margin: 5px 0 0 0;">&copy; InternHub Team (HTU)</p>
          </div>
        </div>
      </div>
    `;

    await sendMail({ to, subject, text, html });
}
